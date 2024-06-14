const WebSocket = require('ws');
const redis = require('redis');
const { v4: uuidv4 } = require('uuid');

// Create Redis clients
const redisClient = redis.createClient();
const pub = redis.createClient();
const sub = redis.createClient();

// Keep track of WebSocket connections
const wsMap = new Map();

(async () => {
    await redisClient.connect();
    await sub.connect();
    await pub.connect();
})();

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

pub.on('error', (err) => {
    console.error('Redis Pub Error:', err);
});

sub.on('error', (err) => {
    console.error('Redis Sub Error:', err);
});

// WebSocket setup
const server = new WebSocket.Server({ port: 8080 });
const initialTime = 300; // 5 minutes in seconds

// Handle WebSocket connection
server.on('connection', (ws) => {
    console.log('New WebSocket connection established.');
    const wsId = uuidv4();
    wsMap.set(wsId, ws);

    ws.on('message', async (message) => {
        console.log('Received message from client:', message);
        const parsedMessage = JSON.parse(message);

        switch (parsedMessage.type) {
            case 'join':
                await handleJoin(wsId, parsedMessage.roomId);
                break;
            case 'move':
                await handleMove(wsId, parsedMessage);
                break;
            case 'enpassant':
                await handleEnpassant(wsId, parsedMessage);
                break;
            case 'draw':
                await declareDraw(parsedMessage.roomId, parsedMessage.reason);
                break;
            default:
                console.log('Unknown message type:', parsedMessage.type);
        }
    });

    ws.on('close', async () => {
        console.log('WebSocket connection closed.');
        wsMap.delete(wsId);
        await handleDisconnect(wsId);
    });
});

// Handle messages from Redis channel
sub.subscribe('moves', (message) => {
    console.log('Received message from Redis channel:', message);
    const parsedMessage = JSON.parse(message);

    // Broadcast the message to the appropriate room
    (async () => {
        const room = JSON.parse(await redisClient.get(`room:${parsedMessage.roomId}`));
        if (room) {
            const whiteClient = wsMap.get(room.white);
            const blackClient = wsMap.get(room.black);
            if (whiteClient) {
                console.log('Sending message to white client:', message);
                whiteClient.send(message);
            }
            if (blackClient) {
                console.log('Sending message to black client:', message);
                blackClient.send(message);
            }
        }
    })();
});

async function handleEnpassant(wsId, message) {
    console.log('Handling enpassant message:', message);
    const roomId = message.roomId;
    const room = JSON.parse(await redisClient.get(`room:${roomId}`));

    if (room) {
        const opponentId = message.point.color === 'w' ? room.black : room.white;
        const opponentWs = wsMap.get(opponentId);
        if (opponentWs) {
            console.log('Sending enpassant message to opponent:', message);
            opponentWs.send(JSON.stringify({
                type: 'enpassant',
                point: message.point
            }));
        }
    }
}

async function handleJoin(wsId, roomId) {
    console.log('Handling join request for room:', roomId);

    try {
        let room = JSON.parse(await redisClient.get(`room:${roomId}`));
        console.log('Fetched room:', room);

        if (!room) {
            room = {
                white: wsId,
                black: null,
                turn: 'w',
                time: { w: initialTime, b: initialTime },
                interval: null
            };
            await redisClient.set(`room:${roomId}`, JSON.stringify(room));
            wsMap.get(wsId).send(JSON.stringify({ type: 'data', color: 'w', roomId }));
            console.log("Player joined as white.");
        } else if (!room.black && room.white !== wsId) {
            room.black = wsId;
            await redisClient.set(`room:${roomId}`, JSON.stringify(room));
            wsMap.get(wsId).send(JSON.stringify({ type: 'data', color: 'b', roomId }));
            console.log("Player joined as black.");
            await startGame(roomId);
        }
    } catch (error) {
        console.error('Error in handleJoin:', error);
    }
}

async function declareDraw(roomId, reason = "") {
    console.log('Declaring draw for room:', roomId);
    const room = JSON.parse(await redisClient.get(`room:${roomId}`));
    if (room) {
        wsMap.get(room.white).send(JSON.stringify({ type: 'draw', reason }));
        wsMap.get(room.black).send(JSON.stringify({ type: 'draw', reason }));
        console.log("Game ended peacefully!");
        await deleteRoom(roomId);
    }
}

async function startGame(roomId) {
    console.log('Starting game for room:', roomId);
    const room = JSON.parse(await redisClient.get(`room:${roomId}`));
    if (room.white && room.black) {
        console.log("Both players connected. Starting game.");
        wsMap.get(room.white).send(JSON.stringify({ type: 'start' }));
        wsMap.get(room.black).send(JSON.stringify({ type: 'start' }));
        room.started = true;
        await redisClient.set(`room:${roomId}`, JSON.stringify(room));
        room.interval = setInterval(() => updateClock(roomId), 1000);
    }
}

async function updateClock(roomId) {
    console.log('Updating clock for room:', roomId);
    const roomData = JSON.parse(await redisClient.get(`room:${roomId}`));
    if (!roomData || !roomData.started) return;

    const currentTurn = roomData.turn;
    roomData.time[currentTurn] -= 1;

    const timeMessage = JSON.stringify({
        type: 'time',
        time: roomData.time,
        color: currentTurn
    });

    const white = wsMap.get(roomData.white);
    const black = wsMap.get(roomData.black);

    if(white && black){
        white.send(timeMessage);
        black.send(timeMessage);
    }
    else{
        clearInterval(roomData.interval);
        return;
    }

    if (roomData.time[currentTurn] <= 0) {
        clearInterval(roomData.interval);
        const endMessage = JSON.stringify({
            type: 'end',
            winner: currentTurn === 'w' ? 'b' : 'w'
        });
        wsMap.get(roomData.white).send(endMessage);
        wsMap.get(roomData.black).send(endMessage);
        await deleteRoom(roomId);
    } else {
        await redisClient.set(`room:${roomId}`, JSON.stringify(roomData));
    }
}

async function handleMove(wsId, message) {
    console.log('Handling move message:', message);
    const roomId = message.roomId;
    const room = JSON.parse(await redisClient.get(`room:${roomId}`));

    if (room) {
        const opponentColor = room.turn === 'w' ? 'b' : 'w';
        room.turn = opponentColor;

        const moveMessage = {
            type: 'move',
            board: message.board,
            from: message.from,
            to: message.to,
            turn: room.turn
        };

        if (room.white && room.black) {
            console.log('Sending move message to both players:', moveMessage);
            wsMap.get(room.white).send(JSON.stringify(moveMessage));
            wsMap.get(room.black).send(JSON.stringify(moveMessage));
        }

        await pub.publish('moves', JSON.stringify(moveMessage));

        clearInterval(room.interval);
        room.interval = setInterval(() => updateClock(roomId), 1000);

        // Remove interval before saving room to Redis
        const { interval, ...roomWithoutInterval } = room;
        await redisClient.set(`room:${roomId}`, JSON.stringify(roomWithoutInterval));

        // Re-attach the interval after saving
        room.interval = interval;
    }
}

async function handleDisconnect(wsId) {
    console.log('Handling WebSocket disconnect.');

    try {
        const roomKeys = await redisClient.keys('room:*');
        console.log('Found room keys:', roomKeys);

        for (const roomId of roomKeys) {
            const room = JSON.parse(await redisClient.get(roomId));
            if (room && (room.white === wsId || room.black === wsId)) {
                await deleteRoom(roomId);
                console.log(`Player(s) disconnected. Room ${roomId} closed.`);
                break;
            }
        }
    } catch (error) {
        console.error('Error handling WebSocket disconnect:', error);
    }
}

async function deleteRoom(roomId) {
    console.log('Deleting room:', roomId);
    try {
        const room = JSON.parse(await redisClient.get(`room:${roomId}`));
        if (room) {
            clearInterval(room.interval);
            await redisClient.del(`room:${roomId}`);
            console.log('Room deleted successfully.');
        }
    } catch (error) {
        console.error('Error deleting room:', error);
    }
}

const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

const rooms = {}; // Key: roomId, Value: { white: ws, black: ws, turn: 'w', time: { w: initialTime, b: initialTime }, interval: null }
const initialTime = 300; // 5 minutes in seconds

server.on('connection', (ws) => {
    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);

        switch (parsedMessage.type) {
            case 'join':
                handleJoin(ws, parsedMessage.roomId);
                break;
            case 'move':
                handleMove(ws, parsedMessage);
                break;
        }
    });
});

function handleJoin(ws, roomId) {
    if (!rooms[roomId]) {
        rooms[roomId] = {
            white: ws,
            black: null,
            turn: 'w',
            time: { w: initialTime, b: initialTime },
            interval: null
        };
        ws.send(JSON.stringify({ type: 'data', color: 'w', roomId }));
        console.log("Player joined as white.");
    } else if (!rooms[roomId].black) {
        rooms[roomId].black = ws;
        ws.send(JSON.stringify({ type: 'data', color: 'b', roomId }));
        console.log("Player joined as black.");
        startGame(roomId);
    }
}

function startGame(roomId) {
    const room = rooms[roomId];
    if (room.white && room.black) {
        console.log("Both players connected. Starting game.");
        room.white.send(JSON.stringify({ type: 'start' }));
        room.black.send(JSON.stringify({ type: 'start' }));
        room.interval = setInterval(() => updateClock(roomId), 1000);
    }
}

function updateClock(roomId) {
    const room = rooms[roomId];
    if (!room) return;

    const currentTurn = room.turn;
    room.time[currentTurn] -= 1;

    // Send updated time to both players
    const timeMessage = JSON.stringify({
        type: 'time',
        active: true,
        time: room.time[currentTurn],
        color: currentTurn
    });

    room.white.send(timeMessage);
    room.black.send(timeMessage);

    // Check if time has run out
    if (room.time[currentTurn] <= 0) {
        clearInterval(room.interval);
        const endMessage = JSON.stringify({
            type: 'end',
            winner: currentTurn === 'w' ? 'b' : 'w'
        });
        room.white.send(endMessage);
        room.black.send(endMessage);
        rooms[roomId] = null;
    }
}

function handleMove(ws, message) {
    const roomId = message.roomId;
    const room = rooms[roomId];

    if (room) {
        // Pause the clock
        const opponentColor = room.turn === 'w' ? 'b' : 'w';
        room.turn = opponentColor;

        const move = {
            type: 'move',
            board: message.board,
            from: message.from,
            to: message.to,
            turn: room.turn
        };
        room.white.send(JSON.stringify(move));
        room.black.send(JSON.stringify(move));
    }
}



function getPlayerColor(ws, room) {
    if (!room) return null;
    if (ws === room.white) return 'w';
    if (ws === room.black) return 'b';
    return null;
}

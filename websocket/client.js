const WebSocket = require('ws')

const ws = new WebSocket('ws://localhost:8080');
const redis = require('redis');

// Create Redis clients
const redisClient = redis.createClient();

(async () => {
    await redisClient.connect();
})();

console.log("Connecting to the Redis");

redisClient.on("ready", async  () => {
    console.log("Connected!");
    const res = await redisClient.get('a');
    console.log(res)
});

redisClient.on("error", (err) => {
    console.log("Error in the Connection");
});

ws.on('open', () => {
    console.log('Connected to server');

    ws.send(JSON.stringify("HOLA"));
});

ws.on('message', (message) => {
    console.log(`Received message from server: ${message}`);
});

ws.on('close', () => {
    console.log('Disconnected from server');
});
const WebSocket = require('ws')

const ws = new WebSocket('ws://localhost:8080');

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
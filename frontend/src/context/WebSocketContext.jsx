import React, { createContext, useContext, useEffect, useState } from 'react';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const [ws, setWs] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const protocol = window.location.protocol.includes('https') ? 'wss' : 'ws';
        const socket = new WebSocket(`ws://localhost:8080`);

        socket.onopen = () => {
            console.log('Connected to WebSocket server');
            setWs(socket);
            setConnected(true);
        };

        socket.onclose = () => {
            console.log('Disconnected from WebSocket server');
            setConnected(false);
        };

        return () => {
            socket.close();
        };
    }, []);

    const awaitConnection = new Promise((resolve) => {
        if (connected) {
            resolve();
        } else {
            const interval = setInterval(() => {
                if (connected) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        }
    });

    return (
        <WebSocketContext.Provider value={{ ws, awaitConnection }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    return useContext(WebSocketContext);
};


import React, { createContext, useContext, useEffect, useState } from 'react';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const [ws, setWs] = useState(null);

    useEffect(() => {
        const protocol = window.location.protocol.includes('https') ? 'wss': 'ws'
        //const socket = new WebSocket(`wss://chessws.onrender.com`);
        const socket = new WebSocket(`ws://localhost:8080`);

        setWs(socket);

        socket.onopen = () => {
            console.log('Connected to WebSocket server')
        };
        socket.onclose = () => console.log('Disconnected from WebSocket server');
        
        return () => socket.close();
    }, []);
    
    return (
        <WebSocketContext.Provider value={ws}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    return useContext(WebSocketContext);
};


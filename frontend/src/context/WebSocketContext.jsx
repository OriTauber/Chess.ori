import React, { createContext, useContext, useEffect, useState } from 'react';

const WebSocketContext = createContext(null);
const wsURI = 'chessws.onrender.com'
const devwsURI = 'localhost:8080'

export const WebSocketProvider = ({ children }) => {
    const [ws, setWs] = useState(null);
    const [connected, setConnected] = useState(false);
    const [serverOnline, setServerOnline] = useState(true);
    const secure = window.location.protocol.includes('https');
    const protocol = secure ? 'wss' : 'ws';
    const checkServerStatus = async () => {
        try {
            const response = await fetch(`${window.location.protocol}://${secure ? wsURI : devwsURI}`, {
                mode: 'no-cors'
            });

            setServerOnline(true);

        } catch (error) {
            setServerOnline(false);
        }
    };

    useEffect(() => {
        
        const socketUrl = `${protocol}://${secure ? wsURI : devwsURI}`;

        const connect = () => {
            const socket = new WebSocket(socketUrl);

            socket.onopen = () => {
                console.log('Connected to WebSocket server');
                setWs(socket);
                setConnected(true);
                setServerOnline(true);
            };

            socket.onclose = () => {
                console.log('Disconnected from WebSocket server');
                setConnected(false);
                setServerOnline(false);

                // Attempt to reconnect after a delay
                setTimeout(connect, 10000);
            };

            socket.onerror = () => {
                console.log('Error connecting to WebSocket server');
                setServerOnline(false);

                // Attempt to reconnect after a delay
                setTimeout(connect, 10000);
            };
        };

        const initiateConnection = async () => {
            await checkServerStatus();
            if (serverOnline) {
                connect();
            }
        };

        initiateConnection();

        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, [serverOnline]);

    const awaitConnection = new Promise((resolve) => {
        if (connected) {
            resolve();
        } else {
            const interval = setInterval(() => {
                if (connected) {
                    clearInterval(interval);
                    resolve();
                }
            }, 300);
        }
    });

    return (
        <WebSocketContext.Provider value={{ ws, awaitConnection, connected, serverOnline }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    return useContext(WebSocketContext);
};

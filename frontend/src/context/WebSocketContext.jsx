import React, { createContext, useContext, useEffect, useState } from 'react';

const WebSocketContext = createContext(null);
const wsURI = 'chessws.onrender.com'
<<<<<<< HEAD
const devwsURI = 'localhost:8080'
=======
<<<<<<< HEAD
>>>>>>> e87a941 (Redis)
const devUri = 'localhost:8080'
const RECONNECT_DELAY_MS = 500;
=======
const devwsURI = 'localhost:8080'
>>>>>>> 919213ba682717b418d8138047a5fa3234440c0c
export const WebSocketProvider = ({ children }) => {
    const [ws, setWs] = useState(null);
    const [connected, setConnected] = useState(false);
    const [serverOnline, setServerOnline] = useState(true);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);

    const checkServerStatus = async () => {
        try {
            const response = await fetch(`http://${devUri}`, {
                mode: 'no-cors'
            });

            setServerOnline(true);

        } catch (error) {
            setServerOnline(false);
        }
    };

    useEffect(() => {
        const protocol = window.location.protocol.includes('https') ? 'wss' : 'ws';
        const socketUrl = `${protocol}://${devUri}`;

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

                // Attempt to reconnect after a delay, but limit the number of attempts
                if (reconnectAttempts < 5) {
                    setTimeout(connect, RECONNECT_DELAY_MS);
                    setReconnectAttempts(reconnectAttempts + 1);
                }
            };

            socket.onerror = () => {
                console.log('Error connecting to WebSocket server');
                setServerOnline(false);

                // Attempt to reconnect after a delay, but limit the number of attempts
                if (reconnectAttempts < 5) {
                    setTimeout(connect, RECONNECT_DELAY_MS);
                    setReconnectAttempts(reconnectAttempts + 1);
                }
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
    }, [serverOnline, reconnectAttempts]);

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

import React, { useState } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import '../styles/JoinMenu.css'
import { Navigate, redirect, useNavigate } from 'react-router-dom';
export default function JoinMenu() {
    const [roomId, setRoomId] = useState('');
    const ws = useWebSocket()
        const navigate = useNavigate();
    const handleJoin = async (e) => {
        
        if (ws && roomId.trim() !== '') {
            ws.send(JSON.stringify({ type: 'join', roomId: roomId.trim() }));
            navigate(`/play/${roomId}`)
        }
    };

    return (
        <div className="JoinMenu">
            <div className='container'>
                <h2>Join a Game</h2>
                <form>
                    <input
                        type="text"
                        placeholder="Enter Room ID"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                    />
                    <button onClick={handleJoin}>Join</button>
                </form>
            </div>
        </div>
    );
}

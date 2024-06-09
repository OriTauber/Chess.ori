import React, { useState } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import Card from '@mui/material/Card';
import '../styles/JoinMenu.css'
import { Navigate, redirect, useNavigate } from 'react-router-dom';
import { Box, Button, CardActionArea, CardActions, CardContent, Input, Typography } from '@mui/material';
import JoinForm from './UI/JoinForm';
export default function JoinMenu() {
    const [roomId, setRoomId] = useState('');
    const {ws, awaitConnection} = useWebSocket()
    const navigate = useNavigate();
    
    const handleJoin = async (e) => {
        e.preventDefault();
        if (roomId.trim() !== '') {
            await awaitConnection;
            if (ws) {
                ws.send(JSON.stringify({ type: 'join', roomId: roomId.trim() }));
                navigate(`/play/${roomId.trim()}`);
            }
        }
    };

    return (
        <div className="JoinMenu">
          <JoinForm handleJoin={handleJoin} setRoomId={setRoomId} roomId={roomId}/>
        </div>
    );
}

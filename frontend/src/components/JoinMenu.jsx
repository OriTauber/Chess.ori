import React, { useState } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import Card from '@mui/material/Card';
import '../styles/JoinMenu.css'
import { Navigate, redirect, useNavigate } from 'react-router-dom';
import { Box, Button, CardActionArea, CardActions, CardContent, Input, Typography } from '@mui/material';
import JoinForm from './UI/JoinForm';
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
          <JoinForm handleJoin={handleJoin} setRoomId={setRoomId} roomId={roomId}/>
        </div>
    );
}

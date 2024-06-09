import { useState, useEffect, useRef } from 'react';
import '../../styles/Clock/Time.css';
import { getOppositeColor } from '../../game/gameLogic';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
export default function Time({ gameState, ws, onTimeEnd, opposite,colora  }) {
    function getInitialColor(){
        return gameState.playerColor || 'w';
    }

    const [color, setColor] = useState(opposite ? getOppositeColor(getInitialColor()) : getInitialColor());
    const [time, setTime] = useState(300);
    const active = useRef(false);
    useEffect(() => {
        setColor(opposite ? getOppositeColor(gameState.playerColor) : gameState.playerColor);

    }, [gameState.playerColor])
    useEffect(() => {

        active.current = gameState.turn === color

    },[gameState.turn])
    useEffect(() => {
        if(gameState.turn === color)
            setTime(gameState.clock[color])
    }, [gameState.clock]);

    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(seconds).padStart(2, '0');
        return `${formattedMinutes}:${formattedSeconds}`;
    }

    return (
        <div className="Time">
            
            <p><AccessAlarmIcon />  {formatTime(time)}</p>
        </div>
    );
}

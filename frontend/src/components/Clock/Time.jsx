import { useState, useEffect } from 'react';
import '../../styles/Clock/Time.css';
import { getOppositeColor } from '../../game/gameLogic';

export default function Time({ gameState, active, onTimeEnd, opposite }) {
    function getInitialColor(){
        return gameState.playerColor || 'w';
    }

    const [color, setColor] = useState(opposite ? getOppositeColor(getInitialColor()) : getInitialColor());
    const [time, setTime] = useState(gameState.clock[color]);
    useEffect(() => {

        setColor(opposite ? getOppositeColor(gameState.playerColor) : gameState.playerColor);
    }, [gameState.playerColor])
    useEffect(() => {
        let localTime = time;
        const intervalId = setInterval(() => {
  
            if (active) {

                if(localTime<= 0) {
                    
                    clearInterval(intervalId);
                    onTimeEnd(color);
                    return;
                }
                else {
                    localTime--;
                    setTime(prevTime => {
                        const newTime = Math.max(prevTime - 1, 0); // Decrement time by 0.1 seconds
                        return newTime;
                    });
                }

            }

        }, 1000);

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, [active]);

    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(seconds).padStart(2, '0');
        return `${formattedMinutes}:${formattedSeconds}`;
    }

    return (
        <div className="Time">
            <p>{formatTime(time)}</p>
        </div>
    );
}

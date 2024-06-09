import Time from "./Time";
import '../../styles/Clock/Clock.css'

export default function ({ ws, onTimeEnd, opposite,gameState }){

    return (
        <div className="Clock">
            <Time ws={ws} onTimeEnd={onTimeEnd} opposite={opposite} gameState={gameState}/>
        </div>
    )
}
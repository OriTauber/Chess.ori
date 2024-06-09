import Time from "./Time";
import '../../styles/Clock/Clock.css'

export default function ({ ws,color, onTimeEnd, opposite,gameState }){

    return (
        <div className="Clock">
            <Time ws={ws} onTimeEnd={onTimeEnd} color={color} opposite={opposite} gameState={gameState}/>
        </div>
    )
}
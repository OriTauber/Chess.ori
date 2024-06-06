import Time from "./Time";
import '../../styles/Clock/Clock.css'
export default function ({ gameState, color, active, onTimeEnd, opposite }){
    console.log(color)
    return (
        <div className="Clock">
            <Time gameState={gameState} active={active} onTimeEnd={onTimeEnd} color={color} opposite={opposite}/>
        </div>
    )
}
import Time from "./Time";
import '../../styles/Clock/Clock.css'

export default function ({ ws, opposite,gameState }){

    return (
        <div className="Clock">
            <Time ws={ws} opposite={opposite} gameState={gameState}/>
        </div>
    )
}
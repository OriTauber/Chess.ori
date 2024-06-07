import "../../styles/Board/Piece.css"
import { getPieceAsset } from "../../game/gameUtils"
export default function({piece, color, handleDragStart}){
    return (

        <img src={getPieceAsset(piece)} alt="" className={`Piece ${color === 'b' && 'Rotate'}`} draggable='true' onDragStart={handleDragStart}/>
 
    )
}
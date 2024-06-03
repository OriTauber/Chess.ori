import "../../styles/Board/Piece.css"
import { getPieceAsset } from "../../game/gameUtils"
export default function({piece}){
    return (

        <img src={getPieceAsset(piece)} alt="" className="Piece"/>
 
    )
}
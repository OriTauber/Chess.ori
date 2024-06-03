import { useState } from "react";
import "../../styles/Board/Square.css"
import Piece from "./Piece"
import Circle from "./Circle";
export default function ({ isWhite, piece, setSelected, isSelected, possibleMove = false, inCheck = false, inMate = false}){

    return(
        <div className={`Square ${isSelected && "Selected"} ${inCheck && 'Check'} ${inMate && 'Mate'}`} style={{backgroundColor: isWhite ? "white" : "black"}} onClick={() => {

            setSelected();

    }}>
        {piece && <Piece piece={piece}/>}
          {possibleMove && <Circle/>}
    </div>
    )
}
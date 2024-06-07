import { useState } from "react";
import "../../styles/Board/Square.css"
import Piece from "./Piece"
import Circle from "./Circle";
export default function ({ isWhite,row,col, piece, setSelected, isSelected,color,onDragOver,onDrop,handleDragStart, possibleMove = false, inCheck = false, inMate = false}){

    return(
        <div className={`Square ${isSelected && "Selected"} ${inCheck && 'Check'} ${inMate && 'Mate'}`} 
        style={{ backgroundColor: isWhite ? "#e9f1fb" : "#84a5b9"}}
        onClick={() => {
        setSelected();
        }}
        onDragOver={onDragOver}
        onDrop={onDrop}
        >
        {piece && <Piece piece={piece} color={color} handleDragStart={(e) => {
            handleDragStart(e, row, col)
        }}/>}
          {possibleMove && <Circle/>}
    </div>
    )
}
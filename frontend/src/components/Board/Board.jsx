import "../../styles/Board/Board.css"
import Square from "./Square"

import { useEffect, useMemo } from "react";
import { isPointValidated } from "../../game/moveValidator";
export default function Board({ gameState, setSelected, isSquareInCheck, isSquareInMate }) {
    useEffect(() => {
        

    }, [])

    const possibleMoves = gameState.selectedPiece.possibleMoves;
    

    console.log()
    return useMemo(() => (
        
        <div className="Board">
            {gameState.board.map((row, rowIndex) => (
                    
                    row.map((piece, colIndex) => {
                        
                        return (
                         <Square
                            key={`${rowIndex}-${colIndex}`}
                            piece={piece}
                            isWhite={(rowIndex * 8 + (colIndex - rowIndex % 2)) % 2 === 0}
                            setSelected={() => setSelected(rowIndex, colIndex)}
                            isSelected={gameState.selectedPiece && gameState.selectedPiece.row === rowIndex && gameState.selectedPiece.col === colIndex}
                            possibleMove={isPointValidated({row: rowIndex, col: colIndex},possibleMoves)}
                            //w-check-4;5
                            inCheck={isSquareInCheck(rowIndex, colIndex)}
                            inMate={isSquareInMate(rowIndex, colIndex)}
                        />
                    )})

            ))}
        </div>
    ), [gameState.board, gameState.selectedPiece, gameState.status]);
}
import "../../styles/Board/Board.css"
import Square from "./Square"

import { useEffect, useMemo } from "react";
import { isPointValidated } from "../../game/moveValidator";
export default function Board({ gameState, setSelected  }) {
    useEffect(() => {
        

    }, [])

    const possibleMoves = gameState.selectedPiece.possibleMoves;

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
                        />
                    )})

            ))}
        </div>
    ), [gameState.board, gameState.selectedPiece]);
}
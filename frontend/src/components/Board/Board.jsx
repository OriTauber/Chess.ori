import "../../styles/Board/Board.css"
import Square from "./Square"

import { useEffect, useMemo } from "react";
import { isPointValidated } from "../../game/moveValidator";
export default function Board({ gameState, setSelected  }) {
    useEffect(() => {
        

    }, [])

    const possibleMoves = gameState.selectedPiece.possibleMoves;
    
    const isSquareInCheck = (row, col) => {
        if(!gameState.status.includes('check')) return false;
        const position = gameState.status.split('-');
        const points = position[2].split(';');
        const checkRow = parseInt(points[0]);
        const checkCol = parseInt(points[1])
        return (points && (checkRow === row && checkCol === col));

    }
    console.log(isSquareInCheck(0, 4))
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
                        />
                    )})

            ))}
        </div>
    ), [gameState.board, gameState.selectedPiece]);
}
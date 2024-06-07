export const getPieceAsset = piece => `/chessPieces/metal/${piece}.png`;

export function movePiece(board, fromRow, fromCol, toRow, toCol, smallCastle = false, bigCastle = false, useWS = false, ws = null, roomId = null) {
    // Deep clone the board to avoid mutating the original state
    const newBoard = board.map(row => [...row]);

    // Retrieve the piece to be moved
    const movedPiece = newBoard[fromRow][fromCol];
    if (!movedPiece) return null; // No piece to move

    // Move the piece to the new position
    newBoard[toRow][toCol] = movedPiece;
    newBoard[fromRow][fromCol] = null;

    if (movedPiece[1] === 'k') {
        if (smallCastle) {
            const rook = newBoard[toRow][7];
            newBoard[toRow][toCol - 1] = rook;
            newBoard[toRow][7] = null;
            if(useWS){
                ws.send(JSON.stringify({
                    type: 'move',
                    roomId: roomId, // Make sure you have a gameId in your gameState
                    from: { row: fromRow, col: fromCol },
                    to: { row: toRow, col: toCol },
                    board: newBoard,
                    turn: gameState.turn === 'w' ? 'b' : 'w',
                }));
            }
        } else if (bigCastle) {
            const rook = newBoard[toRow][0];
            newBoard[toRow][toCol + 1] = rook;
            newBoard[toRow][0] = null;
            if(useWS){
                ws.send(JSON.stringify({
                    type: 'move',
                    roomId: roomId, // Make sure you have a gameId in your gameState
                    from: { row: fromRow, col: fromCol },
                    to: { row: toRow, col: toCol },
                    board: newBoard,
                    turn: gameState.turn === 'w' ? 'b' : 'w',
                }));
            }
        }
    

    }

    return newBoard;
}

export const isPawnPromoting = (row, color) =>
    (color === 'w' && row === 0) || (color === 'b' && row === 7);

export function getDiagonalPawnCaptures(row, col, color) {
    if (color === 'w' && row > 0) {
        return [
            { row: row - 1, col: col + 1 },
            { row: row - 1, col: col - 1 }
        ];
    } else if (color === 'b' && row < 7) {
        return [
            { row: row + 1, col: col + 1 },
            { row: row + 1, col: col - 1 }
        ];
    }
    return [];
}

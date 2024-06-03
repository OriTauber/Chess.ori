export function getPieceAsset(piece) {
    return `/chessPieces/${piece}.png`
}
export function movePiece(board, fromRow, fromCol, toRow, toCol, smallCastle = false, bigCastle = false) {
    // Deep clone the board to avoid mutating the original state
    const newBoard = board.map(row => [...row]);

    // Retrieve the piece to be moved
    const movedPiece = newBoard[fromRow][fromCol];
    if (!movedPiece) return; // No piece to move

    // Move the piece to the new position
    newBoard[toRow][toCol] = movedPiece;
    newBoard[fromRow][fromCol] = null;
    if (movedPiece[1] === 'k') {
        if (smallCastle) {
            const rook = newBoard[toRow][7];
            newBoard[toRow][toCol - 1] = rook;
            newBoard[toRow][7] = null;
        }
        else if (bigCastle) {
            const rook = newBoard[toRow][0];
            newBoard[toRow][toCol + 1] = rook;
            newBoard[toRow][0] = null;
        }
    }


    return newBoard;
}
export function getDiagonalPawnCaptures(row, col, color) {
    if (color === 'w') {
        return [
            {
                row: row - 1,
                col: col + 1
            },
            {
                row: row - 1,
                col: col - 1
            }
        ]
    }
    else {
        return [
            {
                row: row + 1,
                col: col + 1
            },
            {
                row: row + 1,
                col: col - 1
            }
        ]
    }
}


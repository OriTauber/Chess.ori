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
export function convertToChessNotation(fromRow, fromCol, toRow, toCol, isCapture, piece = '') {
    // Map columns (0-7) to files ('a'-'h')
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    // Map rows (0-7) to ranks ('1'-'8')
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

    // Get the starting and ending positions in chess notation
    const fromPos = files[fromCol] + ranks[fromRow];
    const toPos = files[toCol] + ranks[toRow];

    // Determine the move notation
    let moveNotation = '';
    if (piece && piece != 'p') {
        moveNotation += piece;
    }

    if (isCapture) {
        if (piece === 'p') {
            // For pawn captures, include the file of the pawn
            moveNotation += files[fromCol];
        }
        moveNotation += 'x';
    }

    moveNotation += toPos;

    return moveNotation;
}

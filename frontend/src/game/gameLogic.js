import {
    getDiagonals, getKnightMoves, getKingMoves, getQueenMoves,
    getRookMoves, getPawnMoves, isPointValidated, getAllMoveTypes,
    validatePoint
} from "../game/moveValidator";
import { movePiece, getDiagonalPawnCaptures } from "../game/gameUtils";

export function getKingPosition(board, color) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece[0] === color && piece[1] === 'k') return [row, col];
        }
    }
    return [null, null];
}

export function getOppositeColor(color) {
    return color === 'w' ? 'b' : 'w';
}

export function pointsToCaptureInList(board, points, attackingColor) {
    if (!points || points.length === 0) return [];
    return points.filter(point => {
        const piece = board[point.row][point.col];
        return piece && piece[0] !== attackingColor;
    });
}

export function filterPawnOverride(board, points) {
    return points.filter(point => !board[point.row][point.col]);
}

export function filterOwnCapturesAndPins(board, fromRow, fromCol, points, attackingColor, castledRuined, depth = 0) {
    if (depth > 10) { // Arbitrary depth limit to avoid infinite recursion
        console.warn('Recursion depth exceeded');
        return [];
    }

    return points.filter(point => {
        const piece = board[point.row][point.col];
        const isLegal = isMoveLegal(board, fromRow, fromCol, point.row, point.col, attackingColor, castledRuined);

        return (!piece || piece[0] !== attackingColor) && isLegal;
    });
}

export function getAllPieces(board, color) {
    const pieces = [];
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece[0] === color) {
                pieces.push({ row, col, piece });
            }
        }
    }
    return pieces;
}
export function getAllPiecesAllColors(board) {
    const pieces = [];
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece) {
                pieces.push({ row, col, piece });
            }
        }
    }
    return pieces;
}

export function canCaptureCheckingPiece(board, color, checkingPieces, castledRuined, enpassantSquare = null) {
    const pieces = getAllPieces(board, color);
    for (let { row, col, piece } of pieces) {
        const moves = getMovesForPiece(board, row, col, piece, color, castledRuined, false, enpassantSquare);
        for (let move of moves) {
            for (let checkingPiece of checkingPieces) {
                if (move.row === checkingPiece.row && move.col === checkingPiece.col && isMoveLegal(board, row, col, move.row, move.col, color, castledRuined)) {
                    return true;
                }
            }
        }
    }
    return false;
}

export function canBlockCheck(board, color, checkingPieces, kingPosition, castledRuined) {
    if (!checkingPieces || checkingPieces.length > 1) return false; // More than one check means the check cannot be blocked


    const path = getPathToKing(checkingPieces[0], kingPosition);
    const pieces = getAllPieces(board, color);

    for (let { row, col, piece } of pieces) {

        const moves = getMovesForPiece(board, row, col, piece, color, castledRuined);
        if (moves.some(move => path.some(p => p.row === move.row && p.col === move.col) && isMoveLegal(board, row, col, move.row, move.col, color, castledRuined))) {
            return true;
        }
    }
    return false;
}

function getPathToKing(checkingPiece, kingPosition) {
    const [kingRow, kingCol] = kingPosition;
    const path = [];
    let [row, col] = [checkingPiece.row, checkingPiece.col];
    const rowStep = Math.sign(kingRow - row);
    const colStep = Math.sign(kingCol - col);
    do {
        row += rowStep;
        col += colStep;
        path.push({ row, col });
    } while (row !== kingRow || col !== kingCol);
    return path;
}

function handleKingCastling(board, kingMoves, smCastleRuined = true, bigCastleRuined = true, row, col) {
    
    if (!smCastleRuined && board[row][7] && board[row][7].includes('r')) {
        kingMoves.push({ row, col: col + 2, smcastle: true });
    }
    if (!bigCastleRuined && board[row][0] && board[row][0].includes('r')) {
        kingMoves.push({ row, col: col - 2, bigcastle: true });
    }
    return kingMoves.filter(pt => isPathClear(board, row, col, pt.row, pt.col));
}

export function isPathClear(board, fromRow, fromCol, toRow, toCol) {
    const rowIncrement = Math.sign(toRow - fromRow);
    const colIncrement = Math.sign(toCol - fromCol);

    let currentRow = fromRow + rowIncrement;
    let currentCol = fromCol + colIncrement;

    while (currentRow !== toRow || currentCol !== toCol) {
        if (board[currentRow][currentCol]) {
            return false;
        }
        currentRow += rowIncrement;
        currentCol += colIncrement;
    }

    return true;
}

export function getMovesForPiece(board, row, col, piece, color, castledRuined, includeCheckMoves = false, enpassantSquare = null) {
    let moves;
    switch (piece[1]) {
        case 'p': {
            const captures = getDiagonalPawnCaptures(row, col, color);
            const captureList = pointsToCaptureInList(board, captures, color);
            //this also handles en passant
            const validMoves = filterPawnOverride(board, getPawnMoves(board, row, col, color, enpassantSquare));
            moves = includeCheckMoves ? validMoves.concat(captureList) : filterOwnCapturesAndPins(board, row, col, validMoves.concat(captureList), color, castledRuined);
            break;
        }
        case 'n':
            moves = includeCheckMoves ? getKnightMoves(row, col) : filterOwnCapturesAndPins(board, row, col, getKnightMoves(row, col), color, castledRuined);
            break;
        case 'b':
            moves = includeCheckMoves ? getDiagonals(board, row, col) : filterOwnCapturesAndPins(board, row, col, getDiagonals(board, row, col), color, castledRuined);
            break;
        case 'q':
            moves = includeCheckMoves ? getQueenMoves(board, row, col) : filterOwnCapturesAndPins(board, row, col, getQueenMoves(board, row, col), color, castledRuined);
            break;
        case 'k':
            const smCastleRuined = castledRuined.small[color];
            const bigCastleRuined = castledRuined.big[color];
            
            moves = includeCheckMoves ? handleKingCastling(board, getKingMoves(row, col), smCastleRuined, bigCastleRuined, row, col) :
                filterOwnCapturesAndPins(board, row, col, handleKingCastling(board, getKingMoves(row, col), smCastleRuined, bigCastleRuined, row, col), color, castledRuined);
            break;
        case 'r':
            moves = includeCheckMoves ? getRookMoves(board, row, col) : filterOwnCapturesAndPins(board, row, col, getRookMoves(board, row, col), color, castledRuined);
            break;
        default:
            moves = [];
    }
    return moves;
}

function isSquareAttacked(board, row, col, attackerColor) {
    const attackingPieces = getAllPieces(board, attackerColor);
    return attackingPieces.some(({ row: attackerRow, col: attackerCol, piece }) => {
        const movesForPiece = getMovesForPiece(board, attackerRow, attackerCol, piece, attackerColor, {}, true);
        return movesForPiece.some(move => move.row === row && move.col === col);
    });
}

export function isMoveLegal(board, fromRow, fromCol, toRow, toCol, color, castledRuined) {
    const newBoard = makeMove(board, fromRow, fromCol, toRow, toCol);
    const inCheck = isInCheck(newBoard, color, castledRuined);

    return !inCheck;
}

export function makeMove(board, fromRow, fromCol, toRow, toCol) {
    const newBoard = board.map(row => [...row]);
    newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
    newBoard[fromRow][fromCol] = null;
    return newBoard;
}

export function getPiece(board, row, col) {
    return board[row][col] || null;
}

export function squareOccupied(board, row, col) {
    return row !== null && col !== null && board[row][col];
}

export function isSquareSelected(selectedPiece, row, col) {
    return selectedPiece.row === row && selectedPiece.col === col;
}

export function isAnySquareSelected(selectedPiece) {
    return selectedPiece.piece !== null;
}

export function isInCheck(board, color, castledRuined) {
    const [kingRow, kingCol] = getKingPosition(board, color);
    const oppositeColor = getOppositeColor(color);

    // Get all opponent pieces
    const opponentPieces = getAllPieces(board, oppositeColor);

    // Check if any opponent piece has a move targeting the king
    return opponentPieces.some(({ row, col, piece }) => {
        const movesForPiece = getMovesForPiece(board, row, col, piece, oppositeColor, castledRuined, true);
        return movesForPiece.some(move => move.row === kingRow && move.col === kingCol);
    });
}


// function isKingInCheckAfterMove(board, moveFromRow, moveFromCol, moveToRow, moveToCol, color, castledRuined) {
//     const newBoard = makeMove(board, moveFromRow, moveFromCol, moveToRow, moveToCol, true);
//     const [kingRow, kingCol] = getKingPosition(newBoard, color);
//     const oppositeColor = getOppositeColor(color);

//     const opponentPieces = getAllPieces(newBoard, oppositeColor);
//     if(opponentPieces.length === 0) return false;
//     return opponentPieces.some(({ row, col, piece }) => {
//         const movesForPiece = getMovesForPiece(newBoard, row, col, piece, oppositeColor, castledRuined, false);
//         return movesForPiece.some(move => move.row === kingRow && move.col === kingCol);
//     });
// }

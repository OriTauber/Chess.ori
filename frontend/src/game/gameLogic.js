import {
    getDiagonals, getKnightMoves, getKingMoves, getQueenMoves,
    getRookMoves, getPawnMoves, isPointValidated, getAllMoveTypes, isPathClear,
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
    const validatedPoints = [];
    for (let point of points) {
        const piece = board[point.row][point.col];
        if (piece && piece[0] !== attackingColor) {
            validatedPoints.push(point);
        }
    }
    return validatedPoints;
}

export function filterPawnOverride(board, points) {
    return points.filter(point => !board[point.row][point.col]);
}

export function filterOwnCapturesAndPins(board, fromRow, fromCol, points, attackingColor) {
    const validatedPoints = [];
    for (let point of points) {
        const piece = board[point.row][point.col];
        if (!piece || piece[0] !== attackingColor) {
            if (isMoveLegal(board, fromRow, fromCol, point.row, point.col, attackingColor)) {
                validatedPoints.push(point);
            }
        }
    }
    return validatedPoints;
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
export function canCaptureCheckingPiece(board, color, checkingPieces, castledRuined) {
    const pieces = getAllPieces(board, color);
    for (let { row, col, piece } of pieces) {
        const moves = getMovesForPiece(board, row, col, piece, color, castledRuined);
        for (let move of moves) {
            for (let checkingPiece of checkingPieces) {
                if (move.row === checkingPiece.row && move.col === checkingPiece.col) {
                    if (isMoveLegal(board, row, col, move.row, move.col, color)) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

export function canBlockCheck(board, color, checkingPieces, kingPosition, castledRuined) {
    if (checkingPieces.length > 1) return false; // More than one check means the check cannot be blocked
    const [kingRow, kingCol] = kingPosition;
    const checkingPiece = checkingPieces[0];
    const path = getPathToKing(checkingPiece, kingPosition);

    const pieces = getAllPieces(board, color);
    for (let { row, col, piece } of pieces) {
        const moves = getMovesForPiece(board, row, col, piece, color, castledRuined);
        for (let move of moves) {
            if (path.some(p => p.row === move.row && p.col === move.col)) {
                if (isMoveLegal(board, row, col, move.row, move.col, color)) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Helper function to get the path from a checking piece to the king
function getPathToKing(checkingPiece, kingPosition) {
    const [kingRow, kingCol] = kingPosition;
    const path = [];
    let [row, col] = [checkingPiece.row, checkingPiece.col];
    const rowStep = Math.sign(kingRow - row);
    const colStep = Math.sign(kingCol - col);

    while ((row !== kingRow || col !== kingCol) && (row !== checkingPiece.row || col !== checkingPiece.col)) {
        row += rowStep;
        col += colStep;
        path.push({ row, col });
    }
    return path;
}
export function canBlockCheck(board, color, checkingPieces, kingPosition, castledRuined) {
    if (checkingPieces.length > 1) return false; // More than one check means the check cannot be blocked
    const [kingRow, kingCol] = kingPosition;
    const checkingPiece = checkingPieces[0];
    const path = getPathToKing(checkingPiece, kingPosition);

    const pieces = getAllPieces(board, color);
    for (let { row, col, piece } of pieces) {
        const moves = getMovesForPiece(board, row, col, piece, color, castledRuined);
        for (let move of moves) {
            if (path.some(p => p.row === move.row && p.col === move.col)) {
                if (isMoveLegal(board, row, col, move.row, move.col, color)) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Helper function to get the path from a checking piece to the king
function getPathToKing(checkingPiece, kingPosition) {
    const [kingRow, kingCol] = kingPosition;
    const path = [];
    let [row, col] = [checkingPiece.row, checkingPiece.col];
    const rowStep = Math.sign(kingRow - row);
    const colStep = Math.sign(kingCol - col);

    while ((row !== kingRow || col !== kingCol) && (row !== checkingPiece.row || col !== checkingPiece.col)) {
        row += rowStep;
        col += colStep;
        path.push({ row, col });
    }
    return path;
}

export function getMovesForPiece(board, row, col, piece, color, castledRuined = {
    small: { w: false, b: false },
    big: { w: false, b: false }
}, includeCheckMoves = false) {
    switch (piece[1]) {
        case 'p': {
            const captures = getDiagonalPawnCaptures(row, col, color);
            const captureList = pointsToCaptureInList(board, captures, color);
            const validMoves = filterPawnOverride(board, getPawnMoves(row, col, color));
            return includeCheckMoves ? validMoves.concat(captureList) : filterOwnCapturesAndPins(board, row, col, validMoves.concat(captureList), color);
        }
        case 'n':
            return includeCheckMoves ? getKnightMoves(row, col) : filterOwnCapturesAndPins(board, row, col, getKnightMoves(row, col), color);
        case 'b':
            return includeCheckMoves ? getDiagonals(board, row, col) : filterOwnCapturesAndPins(board, row, col, getDiagonals(board, row, col), color);
        case 'q':
            return includeCheckMoves ? getQueenMoves(board, row, col) : filterOwnCapturesAndPins(board, row, col, getQueenMoves(board, row, col), color);
        case 'k':
            return includeCheckMoves ? getKingMoves(castledRuined.small[color], castledRuined.big[color], row, col) : filterOwnCapturesAndPins(board, row, col, getKingMoves(castledRuined.small[color], castledRuined.big[color], row, col), color);
        case 'r':
            return includeCheckMoves ? getRookMoves(board, row, col) : filterOwnCapturesAndPins(board, row, col, getRookMoves(board, row, col), color);
        default:
            return [];
    }
}


export function isMoveLegal(board, fromRow, fromCol, toRow, toCol, color) {
    const newBoard = makeMove(board, fromRow, fromCol, toRow, toCol);
    return !isInCheck(newBoard, color);
}

export function makeMove(board, fromRow, fromCol, toRow, toCol) {
    const newBoard = board.map(row => [...row]);
    newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
    newBoard[fromRow][fromCol] = null;
    return newBoard;
}

export function getPiece(board, row, col) {
    return board[row][col];
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
    const opponentPieces = [];

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece[0] === oppositeColor) {
                opponentPieces.push({ row, col, piece });
            }
        }
    }

    // Check if any opponent piece has a move targeting the king
    for (let { row, col, piece } of opponentPieces) {
        const movesForPiece = getMovesForPiece(board, row, col, piece, oppositeColor, castledRuined, true);
        for (let move of movesForPiece) {
            if (move.row === kingRow && move.col === kingCol) {
                return true;
            }
        }
    }

    return false;
}


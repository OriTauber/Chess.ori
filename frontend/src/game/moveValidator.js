import { isPathClear, squareOccupied } from "./gameLogic";

export const validatePoint = point => point.row >= 0 && point.row <= 7 && point.col >= 0 && point.col <= 7;

const getPlusMinus = (row, col, plusRow, plusCol) => {
    const points = [
        { row: row + plusRow, col: col + plusCol },
        { row: row - plusRow, col: col + plusCol },
        { row: row + plusRow, col: col - plusCol },
        { row: row - plusRow, col: col - plusCol }
    ];
    return points.filter(validatePoint);
};

const getAdjacent = (row, col) => {
    const points = [
        { row: row + 1, col: col },
        { row: row - 1, col: col },
        { row: row, col: col + 1 },
        { row: row, col: col - 1 }
    ];
    return points.filter(validatePoint);
};

export const getKnightMoves = (row, col) => {
    const list1 = getPlusMinus(row, col, 1, 2);
    const list2 = getPlusMinus(row, col, 2, 1);
    return list1.concat(list2);
};

export const getRookMoves = (board, row, col) => {
    const points = [];
    for (let i = 0; i < 8; i++) {
        if (i !== row && isPathClear(board, row, col, i, col)) {
            points.push({ row: i, col });
        }
    }
    for (let j = 0; j < 8; j++) {
        if (j !== col && isPathClear(board, row, col, row, j)) {
            points.push({ row, col: j });
        }
    }
    return points;
};

export const getQueenMoves = (board, row, col) =>
    getRookMoves(board, row, col).concat(getDiagonals(board, row, col));

export const getPawnMoves = (board, row, col, color) => {
    const points = [];
    if (color === 'b' && row < 7) {
        if (isPathClear(board, row, col, row + 1, col)) {
            points.push({ row: row + 1, col });
            if (row === 1 && isPathClear(board, row, col, row + 2, col)) {
                points.push({ row: row + 2, col });
            }
        }
    } else if (color === 'w' && row > 0) {
        if (isPathClear(board, row, col, row - 1, col)) {
            points.push({ row: row - 1, col });
            if (row === 6 && isPathClear(board, row, col, row - 2, col)) {
                points.push({ row: row - 2, col });
            }
        }
    }
    if (color === 'b' && row === 4) {
        if (squareOccupied(board, row, col + 1)){
            points.push({ row: row + 1, col: col + 1 });
        }
        else if (squareOccupied(board, row, col - 1)) {
            points.push({ row: row + 1, col: col - 1 });
        }
    } else if (color === 'w' && row === 3) {
        if (squareOccupied(board, row, col + 1)) {
            points.push({ row: row - 1, col: col + 1 });
        }
        else if (squareOccupied(board, row, col - 1)) {
            points.push({ row: row - 1, col: col - 1 });
        }
    }
    return points;
};

export const getKingMoves = (row, col) =>
    getPlusMinus(row, col, 1, 1).concat(getAdjacent(row, col));

export const getAllMoveTypes = (board, row, col) =>
    getQueenMoves(board, row, col).concat(getKnightMoves(row, col));

export const getDiagonals = (board, row, col) => {
    const points = [];
    for (let i = 0; i < 8; i++) {
        const deltaX = row - i;
        if (i !== row) {
            const point1 = { row: i, col: col + deltaX };
            const point2 = { row: i, col: col - deltaX };
            if (validatePoint(point1) && isPathClear(board, row, col, point1.row, point1.col)) {
                points.push(point1);
            }
            if (validatePoint(point2) && isPathClear(board, row, col, point2.row, point2.col)) {
                points.push(point2);
            }
        }
    }
    return points;
};

export const isPointValidated = (pt, possibleMoves) =>
    possibleMoves && possibleMoves.some(point => point.row === pt.row && point.col === pt.col);

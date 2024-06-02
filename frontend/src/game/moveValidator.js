//returns all points that follow a specific rule
/*{
    row: x,
    col: y
  }
*/
function getPlusMinus(row, col, plusRow, plusCol) {
    const points = [
        { row: row + plusRow, col: col + plusCol },
        { row: row - plusRow, col: col + plusCol },
        { row: row + plusRow, col: col - plusCol },
        { row: row - plusRow, col: col - plusCol }
    ];
    return points.filter(point => validatePoint(point));
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
        if (currentRow >= 8 || currentCol >= 8 || currentRow <= 0 || currentCol <= 0) break;
    }

    return true;
}

function getAdjacent(row, col) {
    const points = [
        {
            row: row + 1,
            col: col
        },
        {
            row: row - 1,
            col: col
        },
        {
            row: row,
            col: col + 1
        },
        {
            row: row,
            col: col - 1
        }
    ]
    return points.filter(point => validatePoint(point))
}
export function getKnightMoves(row, col) {
    const list1 = getPlusMinus(row, col, 1, 2);
    const list2 = getPlusMinus(row, col, 2, 1);
    return list1.concat(list2);
}
export function getRookMoves(board, row, col) {
    const points = [];
    for (let i = 0; i < 8; i++) {
        if (i !== row && isPathClear(board, row, col, i, col)) {
            points.push({ row: i, col: col });
        }
    }
    for (let j = 0; j < 8; j++) {
        if (j !== col && isPathClear(board, row, col, row, j)) {
            points.push({ row: row, col: j });
        }
    }
    return points;
}
export function getQueenMoves(board, row, col) {
    return getRookMoves(board, row, col).concat(getDiagonals(board, row, col));
}
export function getPawnMoves(board, row, col, color) {
    const points = []
    if (color === 'b' && isPathClear(board, row, col, row + 1, col)) {
        points.push({
            row: row + 1,
            col: col
        })
        if (row === 1 && isPathClear(board, row, col, row + 2, col)) {
            points.push({
                row: row + 2,
                col: col
            })
        }
    }
    else if (isPathClear(board, row, col, row - 1, col)){
        points.push({
            row: row - 1,
            col: col
        })
        if (row === 6 && isPathClear(board, row, col, row - 2, col)) {
            points.push({
                row: row - 2,
                col: col
            })
        }
    }
    return points;
}
export function getKingMoves(row, col) {
    const points = getPlusMinus(row, col, 1, 1).concat(getAdjacent(row, col));

    return points;
}
export function getAllMoveTypes(board, row, col) {
    return getQueenMoves(board, row, col).concat(getKnightMoves(row, col));
}
export function getDiagonals(board, row, col) {
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
}

export function isPointValidated(pt, possibleMoves) {
    return possibleMoves && possibleMoves.some(point => {
        return point.row === pt.row && point.col === pt.col
    })

}

export function validatePoint(point) {
    return point.row >= 0 && point.row <= 7 && point.col >= 0 && point.col <= 7
}
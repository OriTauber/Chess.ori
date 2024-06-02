import { useEffect, useState } from "react";
import Board from "./Board/Board";
import { movePiece, getDiagonalPawnCaptures } from "../game/gameUtils"
import {getKingMoves, isPointValidated} from "../game/moveValidator";

import {getKingPosition, getOppositeColor, pointsToCaptureInList, filterPawnOverride, filterOwnCapturesAndPins, getMovesForPiece,
     isMoveLegal, makeMove, getPiece, squareOccupied, isSquareSelected, isAnySquareSelected, isInCheck,
     getAllPieces,
     canCaptureCheckingPiece,
     canBlockCheck} from '../game/gameLogic'

const initialState = {
    board: [
        ['br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br'], // Black pieces
        ['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'], // Black pawns
        [null, null, null, null, null, null, null, null], // Empty squares
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        ['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'], // White pawns
        ['wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr']  // White pieces
    ],
    turn: 'white',
    status: 'beforestart',
    clock: {
        white: 300,
        black: 300
    },
    selectedPiece: {
        row: null,
        col: null,
        piece: null,
        possibleMoves: [

        ]
    },
    castleRuined: {
        small: {
            b: false,
            w: false
        },
        big: {
            b: false,
            w: false
        }
    }
}
export default function () {

    const [gameState, setGameState] = useState(initialState);
    

    function resetSquares() {
        setGameState({
            ...gameState, selectedPiece: {
                row: null,
                col: null,
                piece: null,
                possibleMoves: null
            }
        })
    }


    
    function handleMovePiece(toRow, toCol) {
        
        const fromRow = gameState.selectedPiece.row;
        const fromCol = gameState.selectedPiece.col;

        if (!squareOccupied(gameState.board, fromRow, fromCol) || !isPointValidated({ row: toRow, col: toCol }, gameState.selectedPiece.possibleMoves)) return false;
        const piece = getPiece(gameState.board,fromRow, fromCol);

        if (!piece) return false;
        
        const pieceColor = piece[0];
        const pieceType = piece[1];
        
        const movedWithValidColor = piece[0] === gameState.turn[0];
        if (!movedWithValidColor) return;
        const newBoard = movePiece(gameState.board, gameState.selectedPiece.row, gameState.selectedPiece.col, toRow, toCol, false);
        
        const castleRuined = (pieceType === 'k' || (pieceType === 'r' && fromCol === 7)) && !gameState.castleRuined.small[pieceColor];
        const bigCastleRuined = (pieceType === 'k' || (pieceType === 'r' && fromCol === 0)) && !gameState.castleRuined.big[pieceColor];
        const updatedCastleRuined = { ...gameState.castleRuined };
        updatedCastleRuined.small[pieceColor] = updatedCastleRuined.small[pieceColor] || castleRuined;
        updatedCastleRuined.big[pieceColor] = updatedCastleRuined.big[pieceColor] || bigCastleRuined;

        setGameState(prevState => ({
            ...prevState,
            board: [...newBoard],
            turn: prevState.turn === 'white' ? 'black' : 'white',
            selectedPiece: {
                row: null,
                col: null,
                piece: null,
                possibleMoves: null,
            },
            castleRuined: updatedCastleRuined
        }));
        return true;


    }
    function setSelected(row, col) {
        
        if (isSquareSelected(gameState.selectedPiece,row, col)) {
            setGameState({
                ...gameState, selectedPiece: {
                    row: null,
                    col: null,
                    piece: null,
                    possibleMoves: null
                }
            })
        }
        else {
            if (isAnySquareSelected(gameState.selectedPiece)) {
  
                return handleMovePiece(row, col);
            }
            else {

                const movedPiece = gameState.board[row][col];

                if(!movedPiece) return;
                const color = movedPiece[0] || 'w'

                if(color !== gameState.turn[0]) return;
                
                setGameState(gt => {

                    return {
                        ...gt, selectedPiece: {
                            row,
                            col,
                            piece: movedPiece,
                            possibleMoves: getMovesForPiece(gt.board, row, col, movedPiece, color, gt.castleRuined)
                        }
                    }
                })
                return true;
            }

        }
        return false;
    }
    useEffect(() => {
        const color = gameState.turn[0];
        const inCheck = isInCheck(gameState.board, color, gameState.castleRuined);
        const castledRuined = gameState.castleRuined;

        if (inCheck) {
            const kingPosition = getKingPosition(gameState.board, color);
            const kingMoves = getKingMoves(kingPosition[0], kingPosition[1]);
            const validKingMoves = filterOwnCapturesAndPins(gameState.board, kingPosition[0], kingPosition[1], kingMoves, color, gameState.castleRuined);

            const opponentColor = getOppositeColor(color);
            const checkingPieces = getAllPieces(gameState.board, opponentColor).filter(({ row, col, piece }) => {
                const moves = getMovesForPiece(gameState.board, row, col, piece, opponentColor, castledRuined);
                return moves.some(move => move.row === kingPosition[0] && move.col === kingPosition[1]);
            });

            const canCapture = canCaptureCheckingPiece(gameState.board, color, checkingPieces, castledRuined);
            const canBlock = canBlockCheck(gameState.board, color, checkingPieces, kingPosition, castledRuined);

            const isCheckmate = validKingMoves.length === 0 && !canCapture && !canBlock;

            if (isCheckmate) {
                setGameState(prevState => ({
                    ...prevState,
                    status: `${color} is in checkmate. ${getOppositeColor(color)} wins!`
                }));
            } else {
                setGameState(prevState => ({
                    ...prevState,
                    status: `${color}-check-${kingPosition[0]};${kingPosition[1]}`
                }));
            }
        } else {
            setGameState(prevState => ({
                ...prevState,
                status: 'inprogress'
            }));
        }
    }, [gameState.board, gameState.turn]);
    

    return (
        <Board gameState={gameState} setSelected={setSelected} handleMovePiece={handleMovePiece} pointInCheck={gameState}/>
    )
}
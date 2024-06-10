// src/components/Game.js
import React, { useEffect, useRef, useState } from "react";
import Board from "./Board/Board";
import { movePiece, getDiagonalPawnCaptures, isPawnPromoting } from "../game/gameUtils";
import { getKingMoves, isPointValidated } from "../game/moveValidator";
import {
    getKingPosition, getOppositeColor, pointsToCaptureInList, filterPawnOverride, filterOwnCapturesAndPins, getMovesForPiece,
    isMoveLegal, makeMove, getPiece, squareOccupied, isSquareSelected, isAnySquareSelected, isInCheck,
    getAllPieces, canCaptureCheckingPiece, canBlockCheck,
    getAllPiecesAllColors
} from '../game/gameLogic';
import soundManager from "../game/soundManager";
import Modal from "./Modal";
import Promote from "./Promote";
import Clock from "./Clock/Clock";
import { WebSocketProvider, useWebSocket } from '../context/WebSocketContext';
import '../styles/Game.css';
const initialBoard = [
    ['br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br'], 
    ['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'], 
    [null, null, null, null, null, null, null, null], 
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
    ['wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr']];


    const testBoard = [
    [null, null, null, null, 'bk', null, 'bn', null], 
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null], 
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null], 
    [null, null, null, null, 'wk', null, 'wn', 'wr']];
const initialState = {
    board: initialBoard,
    turn: 'w',
    status: 'beforestart',
    clock: {
        w: 300,
        b: 300,
        status: 'playing'
    },
    selectedPiece: {
        row: null,
        col: null,
        piece: null,
        possibleMoves: []
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
    },
    playerColor: null,
    winner: null
};

const initialPromoteState = { show: false, row: null, col: null, toRow: null, toCol: null };

export default function Game() {


    const [gameState, setGameState] = useState(initialState);
    const [showModal, setShowModal] = useState(false);
    const { ws, awaitConnection } = useWebSocket()
    const [modalMessage, setModalMessage] = useState('');
    const [modalTitle, setModalTitle] = useState('');
    const [showPromote, setShowPromote] = useState(initialPromoteState);
    const disabled = useRef(true);
    const roomId = useRef(null);
    const pawnsOnEnPassant = useRef(null);
    useEffect(() => {
        const setupWebSocket = async () => {
            await awaitConnection;

            if (!ws) return;

            const handleMessage = (event) => {
                const message = JSON.parse(event.data);


                switch (message.type) {
                    case 'data':
                        roomId.current = message.roomId;
                        setGameState((gt) => ({ ...gt, playerColor: message.color }));
                        break;
                    case 'move':

                        handleMoveMessage(message);
                        break;
                    case 'time':
                        handleTimeUpdate(message);
                        break;
                    case 'start':
                        handleStartMessage(message);
                        break;
                    case 'end':
                        onTimeEnd(getOppositeColor(message.winner));
                    case 'enpassant':
                        pawnsOnEnPassant.current = message.point;
                        break;
                    case 'draw':
                        onDraw(message)
                        break;
                    // Add other message types as needed
                    default:
                        break;
                }
            };

            ws.addEventListener('message', handleMessage);

            // Send join message to server
            //ws.send(JSON.stringify({ type: 'join', roomId: roomId.current }));

            return () => {
                ws.removeEventListener('message', handleMessage); // Cleanup
            };
        };

        setupWebSocket();
    }, [ws, awaitConnection]);

    const handleMoveMessage = (message) => {
        console.log(message, "Hi")
        setGameState(prevState => ({
            ...prevState,
            board: message.board,
            turn: message.turn,
            selectedPiece: {
                row: null,
                col: null,
                piece: null,
                possibleMoves: []
            }
        }));
    };
    const handleTimeUpdate = (message) => {
        setGameState((prevState) => ({
            ...prevState,
            clock: {
                ...prevState.clock,
                [message.color]: message.time[message.color]
            }
        }));
    };
    const handleStartMessage = (message) => {
        disabled.current = false;
        setGameState(prevState => ({
            ...prevState,
            roomId: roomId.current
        }));


    };

    const resetSquares = () => {
        setGameState(prevState => ({
            ...prevState,
            selectedPiece: {
                row: null,
                col: null,
                piece: null,
                possibleMoves: []
            }
        }));
    };

    const handleMovePiece = (toRow, toCol) => {

        if (disabled.current) return false;
        const fromRow = gameState.selectedPiece.row;
        const fromCol = gameState.selectedPiece.col;

        if (!squareOccupied(gameState.board, fromRow, fromCol) || !isPointValidated({ row: toRow, col: toCol }, gameState.selectedPiece.possibleMoves)) return false;
        const piece = getPiece(gameState.board, fromRow, fromCol);
        const isACapture = squareOccupied(gameState.board, toRow, toCol);
        if (!piece) return false;

        const pieceColor = piece[0];
        if (!pieceColor === gameState.playerColor) return;
        const pieceType = piece[1];


        // Promoting
        if (pieceType === 'p' && isPawnPromoting(toRow, pieceColor)) {
            return setShowPromote({ show: true, row: fromRow, col: fromCol, toRow, toCol });
        }


        const movedWithValidColor = pieceColor === gameState.turn;
        if (!movedWithValidColor) return;

        if (pieceType === 'p' && Math.abs(fromRow - toRow) === 2) {
            const point = { row: toRow, col: toCol, color: pieceColor };


            ws.send(JSON.stringify({ type: 'enpassant', point, roomId: roomId.current }))
        }

        const smallCastleRuined = (pieceType === 'k' || (pieceType === 'r' && fromCol === 7)) && !gameState.castleRuined.small[pieceColor];
        const bigCastleRuined = (pieceType === 'k' || (pieceType === 'r' && fromCol === 0)) && !gameState.castleRuined.big[pieceColor];
        const updatedCastleRuined = { ...gameState.castleRuined };
        updatedCastleRuined.small[pieceColor] = updatedCastleRuined.small[pieceColor] || smallCastleRuined;
        updatedCastleRuined.big[pieceColor] = updatedCastleRuined.big[pieceColor] || bigCastleRuined;

        const newBoard = movePiece(gameState.board, fromRow, fromCol, toRow, toCol, fromCol - toCol === -2, fromCol - toCol === 2);

        if (pieceType === 'p' && Math.abs(fromRow - toRow) === 1 && Math.abs(fromCol - toCol) === 1 && !squareOccupied(gameState.board, toRow, toCol)) {
            newBoard[toRow + Math.sign(fromRow - toRow)][toCol] = null;
        }
        //reset enpassant pawn
        pawnsOnEnPassant.current = null;
        ws.send(JSON.stringify({
            type: 'move',
            roomId: roomId.current, 
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: piece,
            isCapture: isACapture,
            board: newBoard,
            turn: gameState.turn === 'w' ? 'b' : 'w',
        }));
        setGameState(prevState => ({
            ...prevState,
            board: newBoard,
            turn: prevState.turn === 'w' ? 'b' : 'w',
            selectedPiece: {
                row: null,
                col: null,
                piece: null,
                possibleMoves: []
            },
            castleRuined: updatedCastleRuined
        }));
        checkForDraws(newBoard);

        return true;
    };
    const checkForDraws = (newBoard) => {
        const allPieces = getAllPiecesAllColors(newBoard);
        const kingAndKnights = allPieces
        .map(pi => pi.piece)
        .filter(type => type[1] === 'n');
        console.log(kingAndKnights)
        const isInsufficient = allPieces.length === 2 || (allPieces.length <= 4 && (kingAndKnights.length <= 1 || (kingAndKnights[0] !== kingAndKnights[1])))
        if (isInsufficient) {
            return ws.send(JSON.stringify({
                type: 'draw',
                roomId: roomId.current,
                reason: 'Insufficient material'
            }));
        }
    }
    const promotePiece = piece => {

        if (disabled.current) return;
        const { row: selectedRow, col: selectedCol, toRow, toCol } = showPromote;
        if (selectedRow === null || selectedCol === null) return;

        const newBoard = movePiece(gameState.board, selectedRow, selectedCol, toRow, toCol);
        newBoard[toRow][toCol] = piece;
        ws.send(JSON.stringify({
            type: 'move',
            roomId: roomId.current, // Make sure you have a gameId in your gameState
            from: { row: selectedRow, col: selectedCol },
            to: { row: toRow, col: toCol },
            board: newBoard,
            turn: gameState.turn === 'w' ? 'b' : 'w',
        }));
        setGameState(prevState => ({
            ...prevState,
            board: newBoard,
            selectedPiece: {
                row: null,
                col: null,
                piece: null,
                possibleMoves: []
            },
            turn: getOppositeColor(prevState.turn)
        }));


        setShowPromote(initialPromoteState);
    };

    const onTimeEnd = color => {
        if (gameState.turn === color) {
            const winner = getOppositeColor(color);
            setModalMessage(`${color} lost by time!. ${winner} wins!`);
            setModalTitle(winner === gameState.playerColor ? "You win!" : "You lose!")
            setShowModal(true);
            setGameState(prevState => ({
                ...prevState,
                status: gameState.clock.status,
                winner: winner
            }));
            disabled.current = true;
            return;
        }
    };
    const onDraw = (message) => {

        setModalMessage(`Draw${message.reason ? ` by ${message.reason}` : ''}!`);
        setModalTitle("Draw");
        setShowModal(true);
        setGameState(prevState => ({
            ...prevState,
            status: 'Draw'
        }));
        disabled.current = true;
        return;

    }

    const setSelected = (row, col) => {

        if (disabled.current) return;

        if (isSquareSelected(gameState.selectedPiece, row, col)) {
            resetSquares();
        } else {
            if (isAnySquareSelected(gameState.selectedPiece)) {
                const piece = gameState.board[row][col];

                if (piece && piece[0] === gameState.selectedPiece.piece[0]) {
                    setGameState(prevState => ({
                        ...prevState,
                        selectedPiece: {
                            row,
                            col,
                            piece,
                            possibleMoves: getMovesForPiece(prevState.board, row, col, piece, piece[0], prevState.castleRuined, false, pawnsOnEnPassant.current)
                        }
                    }));
                } else {
                    handleMovePiece(row, col);
                }
            } else {
                const movedPiece = gameState.board[row][col];
                if (!movedPiece) return;

                const color = movedPiece[0] || 'w';
                if (color !== gameState.turn || color !== gameState.playerColor) return;

                setGameState(prevState => ({
                    ...prevState,
                    selectedPiece: {
                        row,
                        col,
                        piece: movedPiece,
                        possibleMoves: getMovesForPiece(prevState.board, row, col, movedPiece, color, prevState.castleRuined, false, pawnsOnEnPassant.current)
                    }
                }));
                return true;
            }
        }
        return false;
    };


    useEffect(() => {
        // Checks and mates, SFX
        const color = gameState.turn;
        const inCheck = isInCheck(gameState.board, color, gameState.castleRuined);

        if (inCheck) {
            let isCheckmate = false;
            soundManager.playSound('check');
            const kingPosition = getKingPosition(gameState.board, color);
            const kingMoves = getKingMoves(kingPosition[0], kingPosition[1]);
            const validKingMoves = filterOwnCapturesAndPins(gameState.board, kingPosition[0], kingPosition[1], kingMoves, color, gameState.castleRuined);

            const opponentColor = getOppositeColor(color);
            const checkingPieces = getAllPieces(gameState.board, opponentColor).filter(({ row, col, piece }) => {
                const moves = getMovesForPiece(gameState.board, row, col, piece, opponentColor, gameState.castleRuined, false, pawnsOnEnPassant.current);
                return moves.some(move => move.row === kingPosition[0] && move.col === kingPosition[1]);
            });

            const canCapture = canCaptureCheckingPiece(gameState.board, color, checkingPieces, gameState.castleRuined, pawnsOnEnPassant.current);
            const isKnightChecking = checkingPieces.some(pi => pi.piece && pi.piece.includes('n'))
            if (!isKnightChecking) {
                const canBlock = canBlockCheck(gameState.board, color, checkingPieces, kingPosition, gameState.castleRuined);
                isCheckmate = validKingMoves.length === 0 && !canCapture && !canBlock;

            }
            else {
                isCheckmate = validKingMoves.length === 0 && !canCapture;
            }

            if (isCheckmate) {
                setModalMessage(`${color} is in checkmate. ${getOppositeColor(color)} wins!`);
                setModalTitle(color === gameState.playerColor ? "You win!" : "You lose!")
                setShowModal(true);
                setGameState(prevState => ({
                    ...prevState,
                    status: `${color}-mate-${kingPosition[0]};${kingPosition[1]}`
                }));
                disabled.current = true;
            }

            else {
                setGameState(prevState => ({
                    ...prevState,
                    status: `${color}-check-${kingPosition[0]};${kingPosition[1]}`
                }));
            }
        } else {
            soundManager.playSound('move');
            setGameState(prevState => ({
                ...prevState,
                status: 'inprogress'
            }));
        }
    }, [gameState.board, gameState.turn, gameState.playerColor]);

    const isSquareInCheck = (row, col) => {
        if (!gameState.status.includes('check')) return false;
        const [, , position] = gameState.status.split('-');
        const [checkRow, checkCol] = position.split(';').map(Number);
        return row === checkRow && col === checkCol;
    };

    const isSquareInMate = (row, col) => {
        if (!gameState.status.includes('mate')) return false;
        const [, , position] = gameState.status.split('-');
        const [mateRow, mateCol] = position.split(';').map(Number);
        return row === mateRow && col === mateCol;
    };
    const handleDrop = (e, toRow, toCol) => {
        e.preventDefault();
        handleMovePiece(toRow, toCol);
    };

    return (
        <div className="Game">

            <Clock ws={ws} onTimeEnd={onTimeEnd} opposite={true} gameState={gameState} />
            {gameState.playerColor && <Board
                gameState={gameState}
                setSelected={setSelected}
                handleMovePiece={handleMovePiece}
                pointInCheck={gameState}
                isSquareInCheck={isSquareInCheck}
                isSquareInMate={isSquareInMate}
                color={gameState.playerColor}
                handleDrop={handleDrop}

            />}
            <Modal
                show={showModal}
                title={modalTitle}
                message={modalMessage}
                onClose={() => setShowModal(false)}
            />
            <Promote
                show={showPromote.show}
                title="Promote:"
                color={gameState.turn}
                onClose={() => setShowPromote(initialPromoteState)}
                promote={promotePiece}
            />
            <Clock ws={ws} onTimeEnd={onTimeEnd} gameState={gameState} />
        </div>
    );
}

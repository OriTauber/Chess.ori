import { Box, Button, List, ListItem, ListItemText, TextField, Typography } from "@mui/material";
import '../../styles/UI/GameMenu.css';
import { useEffect, useRef, useState } from "react";

export default function ({ onResign, onDraw, messages, sendMessage, moves }) {

    const [gameMoves, setMoves] = useState([]);
    const [currentMessage, setCurrentMessage] = useState("");
    const [chatMessages, setChatMessages] = useState([]);
    useEffect(() => {
        if (messages.length > 0) {
            setChatMessages(messages);
        }
    }, [messages])
    useEffect(() => {
        if (moves.length > 0) {
            setMoves(moves);
        }
    }, [moves])
    function handleSendMessage(msg) {
        setCurrentMessage("");
        setChatMessages([...chatMessages, `You: ${msg}`])
        sendMessage(msg);
    }
    return (

        <Box className="GameMenu">
            <Box className="buttons">
                <Button variant="contained" color="error" fullWidth onClick={onResign}>Resign</Button>
                <Button variant="contained" color="error" fullWidth onClick={onDraw}>Offer Draw</Button>
            </Box>
            <Box className="chat">
                <Typography variant="h6">Chat</Typography>
                <List className="chat-messages list">
                    {chatMessages.map((message, index) => (
                        <ListItem key={index} className="messageText">
                            <ListItemText primary={message} />
                        </ListItem>
                    ))}
                </List>
                <form action="" onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(currentMessage)
                }}>
                    <Box className="chat-input">

                        <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            placeholder="Type a message..."
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                        />
                        <Button onClick={() => {
                            handleSendMessage(currentMessage)
                        }} variant="contained" color="primary">
                            Send
                        </Button>

                    </Box>
                </form>
            </Box>
            <Box className="moves moveContainer">
                <Typography variant="h6">Moves</Typography>
                <List className="list">
                    {gameMoves.map((move, index) => (
                        index % 2 === 0 ? (
                            <ListItem key={index} className="moveItem">
                                <ListItemText
                                    primary={
                                        <div className="movePair">
                                            <span>{index / 2 + 1}: {gameMoves[index]}</span>
                                            <span>{gameMoves[index + 1] || ''}</span>
                                        </div>
                                    }
                                />
                            </ListItem>
                        ) : null
                    ))}
                </List>
            </Box>

        </Box>

    )
}
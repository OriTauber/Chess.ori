// src/components/MainMenu.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import '../styles/MainMenu.css'
const MainMenu = () => {
    return (
        <Box
            className="MainMenu"
            display="flex"
            flexDirection="column"
            alignItems="center"
            height="100vh"
            p={2}
        >
            <Box mt={2}>
                <Typography variant="h2" gutterBottom>Welcome to Chess.ori</Typography>
            </Box>

            <Button component={Link} href="/join" variant="contained" color="primary" className='Link'>
                Join Game
            </Button>

            <Button component={Link} href="/register" variant="contained" color="secondary" className='Link'>
                Register
            </Button>
            <Button component={Link} href="/login" variant="contained" color="primary" className='Link'>
                Login
            </Button>

            <img src="/logo.png" alt="" />

        </Box>
    );
};

export default MainMenu;

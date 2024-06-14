import React from 'react';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Game from './components/Game';
import JoinMenu from './components/JoinMenu';
import Register from './components/Users/Register';
import Login from './components/Users/Users';
import MainMenu from './components/MainMenu';

export default function App() {
  return (
    <Router>
      <Routes>

        <Route exact path="/" Component={MainMenu}/>
        <Route exact path="/join" Component={JoinMenu} />
        <Route path="/play/:room" Component={Game}/>
        
        <Route exact path="/register" element={<Register/>} />
        <Route exact path="/login" element={<Login/>} />


      </Routes>
    </Router>
  );
}

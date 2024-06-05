import React from 'react';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Game from './components/Game';
import JoinMenu from './components/JoinMenu';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/join" Component={JoinMenu}/>

        <Route path="/play/:room" Component={Game}/>

      </Routes>
    </Router>
  );
}

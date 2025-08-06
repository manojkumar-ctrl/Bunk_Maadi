import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Page components
import Home from './pages/Home';
import Logger from './pages/Logger';
import Workflow from './pages/Workflow';
import BunkTracker from './pages/BunkTracker';
import {Toaster} from 'react-hot-toast';

// Common layout components
import NavBar from './components/NavBar';
import Footer from './components/Footer';

function App() {
  return (
    <>
    <Toaster/>
      <NavBar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/logger" element={<Logger />} />
        <Route path="/workflow" element={<Workflow />} />
        <Route path="/bunk-tracker" element={<BunkTracker />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;

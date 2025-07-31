import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import all your page components
import Home from './pages/Home';
import Calculator from './pages/Calculator';
import Logger from './pages/Logger';
import Login from './pages/Login';
import Workflow from './pages/Workflow';
import BunkTracker from './pages/BunkTracker'; // The BunkTracker page

// Import your common components (NavBar and Footer)
import NavBar from './components/NavBar'; // Ensure correct capitalization
import Footer from './components/Footer';

function App() {
  return (
    // The BrowserRouter (aliased as Router) should wrap your entire application.
    // There must only be ONE instance of <Router> in your entire React app.
    <Router>
      {/* NavBar is rendered globally, appearing on all pages */}
      <NavBar />

      {/* Routes defines the different paths and their corresponding components */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/logger" element={<Logger />} />
        <Route path="/login" element={<Login />} />
        <Route path="/workflow" element={<Workflow />} />
        <Route path="/bunk-tracker" element={<BunkTracker />} />
        {/* Add more routes here as needed */}
      </Routes>

      {/* Footer is rendered globally, appearing on all pages */}
      <Footer />
    </Router>
  );
}

export default App;

import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import { assets } from '../assets/assets'; // Assuming you have an assets.js file for images

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false); // State to manage mobile menu visibility

  // Function to toggle the mobile menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-lg font-inter">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo and Brand Name */}
        <Link to="/" className="flex items-center space-x-2">
          {/* Ensure assets.logo is correctly imported and available */}
          {assets.logo && (
            <img src={assets.logo} alt="Logo" className="h-8 w-8 rounded-full" />
          )}
          <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Bunk Maadi
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex space-x-6 text-lg">
          <Link to="/" className="hover:text-blue-300 transition duration-300 ease-in-out transform hover:scale-105">
            Home
          </Link>
          <Link to="/calculator" className="hover:text-blue-300 transition duration-300 ease-in-out transform hover:scale-105">
            Calculator
          </Link>
          <Link to="/logger" className="hover:text-blue-300 transition duration-300 ease-in-out transform hover:scale-105">
            Logger
          </Link>
          <Link to="/workflow" className="hover:text-blue-300 transition duration-300 ease-in-out transform hover:scale-105">
            How It Works
          </Link>
          {/* New link for Bunk Tracker */}
          <Link to="/bunk-tracker" className="hover:text-blue-300 transition duration-300 ease-in-out transform hover:scale-105">
            Bunk Tracker
          </Link>
          <Link to="/login" className="hover:text-blue-300 transition duration-300 ease-in-out transform hover:scale-105">
            Login
          </Link>
        </div>

        {/* Mobile Menu Button (Hamburger Icon) */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="focus:outline-none">
            {/* Ensure assets.menu_icon is correctly imported and available */}
            {assets.menu_icon && (
              <img src={assets.menu_icon} alt="Menu" className="h-7 w-7" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-gray-700 mt-4 rounded-lg shadow-xl">
          <ul className="flex flex-col items-center py-4 space-y-3 text-lg">
            <li>
              <Link
                to="/"
                onClick={toggleMenu}
                className="block py-2 px-4 hover:bg-gray-600 rounded-md w-full text-center transition duration-200"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/calculator"
                onClick={toggleMenu}
                className="block py-2 px-4 hover:bg-gray-600 rounded-md w-full text-center transition duration-200"
              >
                Calculator
              </Link>
            </li>
            <li>
              <Link
                to="/logger"
                onClick={toggleMenu}
                className="block py-2 px-4 hover:bg-gray-600 rounded-md w-full text-center transition duration-200"
              >
                Logger
              </Link>
            </li>
            <li>
              <Link
                to="/workflow"
                onClick={toggleMenu}
                className="block py-2 px-4 hover:bg-gray-600 rounded-md w-full text-center transition duration-200"
              >
                How It Works
              </Link>
            </li>
            {/* New link for Bunk Tracker in mobile menu */}
            <li>
              <Link
                to="/bunk-tracker"
                onClick={toggleMenu}
                className="block py-2 px-4 hover:bg-gray-600 rounded-md w-full text-center transition duration-200"
              >
                Bunk Tracker
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                onClick={toggleMenu}
                className="block py-2 px-4 hover:bg-gray-600 rounded-md w-full text-center transition duration-200"
              >
                Login
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}

export default NavBar;

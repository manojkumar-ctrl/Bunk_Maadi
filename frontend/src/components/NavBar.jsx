import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../assets/assets';
import { useClerk, UserButton, useUser } from '@clerk/clerk-react';

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { openSignIn } = useClerk();
  const { user } = useUser();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/calculator', label: 'Calculator' },
    { path: '/logger', label: 'Logger' },
    { path: '/workflow', label: 'How It Works' },
    { path: '/bunk-tracker', label: 'Bunk Tracker' },
  ];

  return (
    <nav className="bg-blue-800 text-white p-4 shadow-lg font-inter relative z-50">
      <div className="container mx-auto flex justify-between items-center">
      
             <Link to="/"className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Can-I-Bunk
          
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6 text-lg">
          {navLinks.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className="hover:text-blue-300 transition duration-300 ease-in-out transform hover:scale-105"
            >
              {label}
            </Link>
          ))}

          {/* Clerk Auth */}
          <div className="ml-2 flex items-center">
            {user ? (
              <div className="h-9 w-9 flex items-center justify-center">
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <button
                onClick={openSignIn}
                className="rounded-full text-sm bg-green-500 hover:bg-green-600 text-white px-5 py-1.5 transition"
              >
                Login
              </button>
            )}
          </div>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="focus:outline-none">
            {assets.menu_icon && (
              <img src={assets.menu_icon} alt="Menu" className="h-7 w-7" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex flex-col items-center justify-center space-y-6 text-xl transition-all duration-300 z-50">
          {/* Close Button */}
          <button
            onClick={toggleMenu}
            className="absolute top-4 right-4 text-white text-3xl font-bold focus:outline-none"
          >
            ×
          </button>

          {/* Mobile Nav Links */}
          {navLinks.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              onClick={toggleMenu}
              className="hover:text-blue-300 transition duration-300 ease-in-out"
            >
              {label}
            </Link>
          ))}

          {/* Clerk Auth in Mobile */}
          <div className="mt-4">
            {user ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <button
                onClick={() => {
                  toggleMenu();
                  openSignIn();
                }}
                className="rounded-full text-sm bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 transition"
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default NavBar;

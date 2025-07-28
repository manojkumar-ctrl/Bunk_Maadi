import React, { useState } from 'react';
import { assets } from '../assets/assets.js';
import { NavLink, Link, useLocation } from 'react-router-dom'; // Import useLocation

const NavBar = () => {
  const [visible, setVisible] = useState(false);
  const location = useLocation(); // Get the current location object

  // Helper function to check if a path is active
  const isPathActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="w-full fixed top-0 left-0 z-50 bg-gray-200 text-black shadow-md">
      <div className="flex items-center justify-between w-full py-2 px-4 md:px-8 font-medium">

        {/* Left: Logo */}
        <Link to="/" className="flex items-center">
          <img src={assets.logo} className="w-15 h-auto rounded-full " alt="Logo" />
        </Link>

        {/* Center: Desktop Navigation */}
        <ul className="hidden sm:flex gap-8 text-sm text-gray-700">
          <NavLink
            to="/"
            className={`flex flex-col items-center gap-1 hover:text-gray-900 transition-colors duration-200 ${
              isPathActive('/') ? 'text-gray-900 font-bold' : ''
            }`}
            onClick={() => setVisible(false)}
          >
            <p>HOME</p>
            <hr className={`w-2/4 border-none h-[1.5px] bg-gray-700 ${isPathActive('/') ? 'block' : 'hidden'}`} />
          </NavLink>

          <NavLink
            to="/calculator"
            className={`flex flex-col items-center gap-1 hover:text-gray-900 transition-colors duration-200 ${
              isPathActive('/calculator') ? 'text-gray-900 font-bold' : ''
            }`}
            onClick={() => setVisible(false)}
          >
            <p>CALCULATOR</p>
            <hr className={`w-2/4 border-none h-[1.5px] bg-gray-700 ${isPathActive('/calculator') ? 'block' : 'hidden'}`} />
          </NavLink>

          <NavLink
            to="/logger"
            className={`flex flex-col items-center gap-1 hover:text-gray-900 transition-colors duration-200 ${
              isPathActive('/logger') ? 'text-gray-900 font-bold' : ''
            }`}
            onClick={() => setVisible(false)}
          >
            <p>ATTENDANCE LOGGER</p>
            <hr className={`w-2/4 border-none h-[1.5px] bg-gray-700 ${isPathActive('/logger') ? 'block' : 'hidden'}`} />
          </NavLink>

          <NavLink
            to="/workflow"
            className={`flex flex-col items-center gap-1 hover:text-gray-900 transition-colors duration-200 ${
              isPathActive('/workflow') ? 'text-gray-900 font-bold' : ''
            }`}
            onClick={() => setVisible(false)}
          >
            <p>HOW IT WORKS</p>
            <hr className={`w-2/4 border-none h-[1.5px] bg-gray-700 ${isPathActive('/workflow') ? 'block' : 'hidden'}`} />
          </NavLink>
        </ul>

        {/* Right: Icons and Mobile Menu Toggle */}
        <div className="flex items-center gap-6 pr-4">
          {/* Profile dropdown */}
          <div className="group relative">
            <img src={assets.profile_icon} className="w-6 h-6 cursor-pointer rounded-full" alt="Profile" />
            <div className="group-hover:block hidden absolute right-0 pt-4 z-20">
              <div className="flex flex-col gap-2 w-36 py-3 px-5 bg-white text-gray-700 rounded-md shadow-lg border border-gray-100">
                <p className="cursor-pointer hover:text-black transition-colors duration-150">My Profile</p>
                <p className="cursor-pointer hover:text-black transition-colors duration-150">Settings</p>
                <p className="cursor-pointer hover:text-black transition-colors duration-150">Logout</p>
              </div>
            </div>
          </div>

          {/* Mobile menu icon */}
          <img
            onClick={() => setVisible(true)}
            src={assets.menu_icon}
            className="w-6 h-6 cursor-pointer sm:hidden"
            alt="Menu"
          />
        </div>
      </div>

      {/* Sidebar for mobile */}
      <div
        className={`fixed top-0 right-0 h-full bg-white z-40 transition-all duration-300 transform ${
          visible ? 'translate-x-0 w-3/4 sm:w-1/2 md:w-1/3' : 'translate-x-full w-0'
        }`}
      >
        <div className="flex flex-col text-gray-700 h-full p-5 pt-8">
          <div onClick={() => setVisible(false)} className="flex items-center gap-4 p-3 cursor-pointer mb-4 border-b pb-4">
            <img className="h-5 rotate-180" src={assets.dropdown_icon} alt="Back" />
            <p className="text-lg font-semibold">Back</p>
          </div>

          {/* Mobile NavLinks with active styling */}
          <NavLink
            onClick={() => setVisible(false)}
            className={`py-3 px-6 border-b text-lg ${isPathActive('/') ? 'font-bold text-blue-600' : 'text-gray-700 hover:text-blue-500'}`}
            to="/"
          >
            HOME
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className={`py-3 px-6 border-b text-lg ${isPathActive('/calculator') ? 'font-bold text-blue-600' : 'text-gray-700 hover:text-blue-500'}`}
            to="/calculator"
          >
            CALCULATOR
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className={`py-3 px-6 border-b text-lg ${isPathActive('/logger') ? 'font-bold text-blue-600' : 'text-gray-700 hover:text-blue-500'}`}
            to="/logger"
          >
            ATTENDANCE LOGGER
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className={`py-3 px-6 border-b text-lg ${isPathActive('/workflow') ? 'font-bold text-blue-600' : 'text-gray-700 hover:text-blue-500'}`}
            to="/workflow"
          >
            HOW IT WORKS
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
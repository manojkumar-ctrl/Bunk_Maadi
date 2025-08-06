import React from 'react';
import { assets } from '../assets/assets';

const Footer = () => {
  return (
    <div className="bg-gray-900 text-white text-sm">
      <div className="max-w-6xl mx-auto px-4 py-10 grid sm:grid-cols-[3fr_1fr_1fr] gap-14">
        {/* Logo + Description */}
        <div>
          <img src={assets.logo} className="mb-5 w-20" alt="Logo" />
          <p className="text-slate-300">
            Can-I-Bunk is a smart attendance planner that helps students track subject-wise attendance,
            apply college-specific thresholds, and calculate how many classes they can safely miss—
            so they never fall short.
          </p>
        </div>

        {/* Company Links */}
        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>
          <ul className="flex flex-col gap-1 text-slate-300">
            <li>Home</li>
            <li>About Can-I-Bunk</li>
            <li>How It Works</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <p className="text-xl font-semibold mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-1 text-slate-300">
            <li>+91-98802xxxxx</li>
            <li>tonydolphin71@gmail.com</li>
            <li>Creator:Manojkumar @BMSCE, Dhanraj @MSRIT</li>
            <li>Built for students who are smarter</li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="border-t border-gray-700 text-center py-5 text-slate-400">
        <p>© 2025 CanIBunk.com — All Rights Reserved.</p>
        <p className="mt-2 text-white">Made with ❤️</p>
      </div>
    </div>
  );
};

export default Footer;

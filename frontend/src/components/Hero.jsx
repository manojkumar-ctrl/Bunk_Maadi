import React from 'react';
import { assets } from '../assets/assets';

const Hero = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Image */}
      <img
        src={assets.hero_img}
        alt="Hero Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
        loading="eager"
        decoding="async"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* Top and Bottom Gradient Overlays */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {/* Top fade */}
        <div className="absolute top-0 w-full h-1/4 bg-gradient-to-b from-black via-transparent to-transparent" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 w-full h-1/4 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="absolute inset-0 z-30 flex items-center justify-center p-4 text-white text-center">
        {/* Example content */}
        {/* 
        <div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Your Catchy Headline</h1>
          <p className="text-lg md:text-xl mb-8">A compelling sub-headline that explains your value.</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full text-lg transition duration-300">
            Call to Action
          </button>
        </div> 
        */}
      </div>
    </div>
  );
};

export default Hero;

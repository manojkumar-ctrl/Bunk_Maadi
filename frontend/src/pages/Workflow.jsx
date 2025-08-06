import React from 'react';
import { FaClipboardCheck, FaCalculator, FaBrain, FaBell } from 'react-icons/fa';

const steps = [
  {
    title: '1. Input Attendance Data',
    description: 'Enter the subject credits, classes attended, and classes conducted for each subject.',
    icon: <FaClipboardCheck className="text-blue-500 w-8 h-8" />
  },
  {
    title: '2. Calculate Bunkable Classes',
    description: 'BunkMaadi checks your current attendance and tells you how many more classes you can miss safely.',
    icon: <FaCalculator className="text-yellow-500 w-8 h-8" />
  },
  {
    title: '3. Smart Bunking Suggestions',
    description: 'Our algorithm evaluates risk and gives smart suggestions on whether you can bunk based on credits and past attendance.',
    icon: <FaBrain className="text-purple-500 w-8 h-8" />
  },
  {
    title: '4. Stay Notified',
    description: 'Get alerts before you fall into the danger zone and keep track with your dashboard.',
    icon: <FaBell className="text-green-500 w-8 h-8" />
  }
];

const Workflow = () => {
  return (
    <div className="py-16 px-4 bg-gray-900 text-white font-inter mt-20 mb-30 ">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-extrabold mb-4 text-blue-400">How BunkMaadi Works</h2>
        <p className="text-gray-300 mb-12 text-lg">
          Understand the step-by-step process of how your attendance is analyzed to give you smart bunking advice.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300 shadow-lg"
            >
              <div className="flex items-center justify-center mb-4">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Workflow;


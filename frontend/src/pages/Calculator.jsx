import React, { useState } from 'react';

const Calculator = () => {
  const [theoryCredits, setTheoryCredits] = useState('');
  const [classesAttended, setClassesAttended] = useState('');
  const [classesConducted, setClassesConducted] = useState('');
  const [resultMessage, setResultMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentAttendancePercentage, setCurrentAttendancePercentage] = useState(0);
  const [showBunkOmeter, setShowBunkOmeter] = useState(false);

  const ATTENDANCE_CRITICAL_THRESHOLD = 60;
  const ATTENDANCE_WARNING_THRESHOLD = 80;
  const ATTENDANCE_SAFE_THRESHOLD = 80;

  const calculateAttendance = () => {
    setResultMessage('');
    setErrorMessage('');
    setCurrentAttendancePercentage(0);
    setShowBunkOmeter(false);

    const C_T = parseInt(theoryCredits);
    const A_current = parseInt(classesAttended);
    const C_current = parseInt(classesConducted);

    if (isNaN(C_T) || isNaN(A_current) || isNaN(C_current)) {
      setErrorMessage('Please enter valid numbers for all fields.');
      return;
    }
    if (C_T <= 0 || A_current < 0 || C_current < 0) {
      setErrorMessage('Credits must be positive. Attended/Conducted classes cannot be negative.');
      return;
    }
    if (A_current > C_current) {
      setErrorMessage('Classes attended cannot be more than classes conducted.');
      return;
    }
    if (C_T > 4) {
      setErrorMessage('Number of credits cannot exceed 4.');
      return;
    }
    if (A_current >= 55) {
      setErrorMessage('Classes attended cannot be 55 or more.');
      return;
    }

    const calculatedCurrentPercentage = C_current > 0 ? (A_current / C_current) * 100 : 0;
    setCurrentAttendancePercentage(calculatedCurrentPercentage);

    const classesAlreadyMissed = C_current - A_current;
    const allowedBunksByRule = C_T * 2;
    const remainingBunks = allowedBunksByRule - classesAlreadyMissed;
    const exceededBy = classesAlreadyMissed - allowedBunksByRule;

    let message = '';

    if (remainingBunks >= 0) {
      message = `You can bunk <strong>${remainingBunks}</strong> more classes at Max.`;
    } else {
      if (exceededBy >= 3 && exceededBy <= 4) {
        message = `You've exceeded your bunk limit by <strong>${exceededBy}</strong> classes. You might still get attendance because teachers sometimes grant it on their own.`;
      } else {
        message = `You have exceeded the number of bunkable classes. Now you can rely on your teacher and certificates.`;
      }
    }

    setResultMessage(message);
    setShowBunkOmeter(true);
  };

  const getMeterMessage = () => {
    if (currentAttendancePercentage >= ATTENDANCE_SAFE_THRESHOLD) {
      return 'Excellent! You are well within limits.';
    } else if (currentAttendancePercentage >= ATTENDANCE_CRITICAL_THRESHOLD) {
      return 'Caution: You are in the warning zone.';
    } else if (currentAttendancePercentage > 0) {
      return 'Warning: Your attendance is critical!';
    }
    return 'Enter details to see your status.';
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gray-900 font-inter text-gray-100">
      <div className="bg-gray-800 p-10 rounded-2xl shadow-2xl w-full max-w-2xl border-2 border-gray-600">
        <h1 className="text-3xl font-extrabold text-center text-white mb-8 mt-8">Bunk-O-Meter</h1>

        <div className="p-8 bg-gray-700 rounded-xl border-2 border-gray-600 shadow-xl mb-10">
          <h2 className="text-2xl font-bold text-blue-400 mb-6">Calculate Bunkable Classes</h2>

          <div className="mb-5">
            <label htmlFor="theoryCredits" className="block text-gray-300 text-sm font-medium mb-2">
              Credits of a Subject:
            </label>
            <input
              type="number"
              id="theoryCredits"
              className="shadow-sm appearance-none border border-gray-600 rounded-md w-full py-2.5 px-4 bg-gray-900 text-white leading-tight focus:outline-none focus:ring-3 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
              placeholder="e.g., 4"
              min="1"
              value={theoryCredits}
              onChange={(e) => setTheoryCredits(e.target.value)}
            />
          </div>

          <div className="mb-5">
            <label htmlFor="classesAttendedCurrent" className="block text-gray-300 text-sm font-medium mb-2">
              Classes Attended:
            </label>
            <input
              type="number"
              id="classesAttendedCurrent"
              className="shadow-sm appearance-none border border-gray-600 rounded-md w-full py-2.5 px-4 bg-gray-900 text-white leading-tight focus:outline-none focus:ring-3 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
              placeholder="e.g., 22"
              min="0"
              value={classesAttended}
              onChange={(e) => setClassesAttended(e.target.value)}
            />
          </div>

          <div className="mb-8">
            <label htmlFor="classesConductedCurrent" className="block text-gray-300 text-sm font-medium mb-2">
              Classes Conducted:
            </label>
            <input
              type="number"
              id="classesConductedCurrent"
              className="shadow-sm appearance-none border border-gray-600 rounded-md w-full py-2.5 px-4 bg-gray-900 text-white leading-tight focus:outline-none focus:ring-3 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
              placeholder="e.g., 27"
              min="0"
              value={classesConducted}
              onChange={(e) => setClassesConducted(e.target.value)}
            />
          </div>

          <button
            onClick={calculateAttendance}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:-translate-y-0.5 hover:shadow-xl"
          >
            Calculate
          </button>

          {errorMessage && (
            <div id="attendanceError" className="mt-6 p-4 bg-red-800 text-red-100 rounded-md text-center font-medium shadow-md border border-red-700 animate-fadeIn">
              <span dangerouslySetInnerHTML={{ __html: errorMessage }} />
            </div>
          )}

          {resultMessage && (
            <div id="attendanceResult" className="mt-6 p-4 bg-blue-800 text-blue-100 rounded-md text-center font-medium shadow-md border border-blue-700 animate-fadeIn">
              <span dangerouslySetInnerHTML={{ __html: resultMessage }} />
            </div>
          )}
        </div>

        {showBunkOmeter && (
          <div className="mt-10 p-8 rounded-xl border-2 border-gray-700 bg-gray-900 flex flex-col items-center shadow-inner transition-opacity duration-500 opacity-100">
            <h3 className="text-xl font-semibold text-gray-200 mb-5">Your Attendance Safety</h3>

            {/* Gauge Meter */}
            <div className="relative w-64 h-32 overflow-hidden">
              <div
                className="absolute top-0 left-0 w-64 h-64 rounded-full border-[16px] border-gray-700"
                style={{
                 background: `conic-gradient(
  from 270deg,
  #EF4444 0deg 108deg,     // 🔴 Red (0–60%)
  #F59E0B 108deg 144deg,   // 🟡 Yellow (60–80%)
  #22C55E 144deg 180deg    // 🟢 Green (80–100%)
);
`,
                  transform: 'rotate(180deg)' // ✅ THIS LINE FIXES THE YELLOW DISPLAY
                }}
              >
                <div className="absolute top-[16px] left-[16px] w-[calc(100%-32px)] h-[calc(100%-32px)] bg-gray-900 rounded-full"></div>
              </div>

             <div
  className="absolute w-3 h-28 origin-bottom center transition-transform duration-700 ease-out"
  style={{
    bottom: '0', // Stick to bottom of the gauge
    left: '50%',
    transform: `translateX(-50%) rotate(${(currentAttendancePercentage / 100) * 180 - 90}deg)`
  }}
>

                <div className="absolute bottom-0 w-full h-full bg-blue-500 rounded-t-full shadow-lg"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-blue-700 border-2 border-white"></div>
              </div>
            </div>

            {/* % Display Below Meter */}
            <div className="mt-4 text-white text-4xl font-bold drop-shadow-lg">
              {currentAttendancePercentage.toFixed(0)}%
            </div>

            <p className="mt-6 text-base text-gray-300 font-medium text-center">
              {getMeterMessage()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calculator;

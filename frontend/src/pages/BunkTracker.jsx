import React, { useState, useEffect } from 'react';
// Navbar and Footer are rendered in App.jsx, so they are NOT imported or used here.

function BunkTracker() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newTotalClasses, setNewTotalClasses] = useState('');
  const [newAttendedClasses, setNewAttendedClasses] = useState('');
  const [newMinAttendance, setNewMinAttendance] = useState('75'); // Default minimum attendance

  // AI Bunk Prediction State
  const [aiPredictionLoading, setAiPredictionLoading] = useState(false);
  const [aiPredictionResult, setAiPredictionResult] = useState(null);
  const [selectedSubjectForAI, setSelectedSubjectForAI] = useState('');
  const [bengaluruWeather, setBengaluruWeather] = useState('Fetching weather...');
  const [hasStrikesOrEmergency, setHasStrikesOrEmergency] = useState('No'); // 'Yes' or 'No'

  // Mock userId for now. In a real app, this would come from authentication context.
  // IMPORTANT: Replace 'student123' with a dynamic userId from your authentication system
  const userId = 'student123';

  const API_BASE_URL = 'http://localhost:5000/api'; // Your backend API base URL

  // Fetch weather data from your backend proxy (part of AI prediction endpoint)
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // This initial call to /predict-bunk is just to get the weather info from backend.
        // In a more optimized setup, you might have a separate /api/weather endpoint.
        const response = await fetch(`${API_BASE_URL}/predict-bunk`, {
          method: 'POST', // Use POST as the AI endpoint is POST
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // Send dummy data as this call is just for weather
            subjectName: 'dummy',
            currentAttendance: 0,
            minRequiredAttendance: 0,
            hasStrikesOrEmergency: 'No'
          })
        });
        const data = await response.json();
        if (response.ok) {
          setBengaluruWeather(data.weather || 'Weather data unavailable.');
        } else {
          console.error('Error fetching weather:', data.message);
          setBengaluruWeather('Weather data unavailable.');
        }
      } catch (error) {
        console.error('Failed to fetch weather:', error);
        setBengaluruWeather('Weather data unavailable.');
      }
    };
    fetchWeather();
    const weatherInterval = setInterval(fetchWeather, 300000); // Update every 5 mins
    return () => clearInterval(weatherInterval);
  }, []);


  // Fetch subjects from backend
  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      setError(null);
      try {
        // Pass userId as a query parameter for filtering subjects by user
        const response = await fetch(`${API_BASE_URL}/subjects?userId=${userId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSubjects(data);
        if (data.length > 0) {
          // Set the first subject as selected for AI prediction by default
          setSelectedSubjectForAI(data[0]._id); // Use _id from MongoDB
        }
      } catch (err) {
        console.error("Error fetching subjects:", err);
        setError("Failed to load subjects. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, [userId]); // Re-fetch if userId changes (important for auth systems)

  const calculateAttendancePercentage = (subject) => {
    if (subject.totalClasses === 0) return 0;
    return ((subject.attendedClasses / subject.totalClasses) * 100).toFixed(2);
  };

  const calculateClassesSafeToBunk = (subject) => {
    const currentAttendance = parseFloat(calculateAttendancePercentage(subject));
    if (currentAttendance < subject.minAttendance) return 0;

    let safeBunks = 0;
    let tempAttended = subject.attendedClasses;
    let tempTotal = subject.totalClasses;

    // Simulate bunking one class at a time to find how many more can be bunked
    while (tempAttended / (tempTotal + 1) * 100 >= subject.minAttendance) {
      safeBunks++;
      tempTotal++;
    }
    return safeBunks;
  };

  const handleBunkedClick = async (subjectId, subjectName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bunk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId, userId: userId }) // Pass userId for leaderboard update
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log('Bunk recorded successfully:', result.message);
      // Re-fetch subjects to get updated data from backend
      // Alternatively, update local state based on backend response if it sends back the updated subject
      // For simplicity, we'll re-fetch all subjects here.
      const updatedSubjectsResponse = await fetch(`${API_BASE_URL}/subjects?userId=${userId}`);
      const updatedSubjectsData = await updatedSubjectsResponse.json();
      setSubjects(updatedSubjectsData);
      setError(null);
    } catch (e) {
      console.error("Error recording bunk:", e);
      setError("Failed to record bunk. Please try again.");
    }
  };

  const handleAttendedClick = async (subjectId, subjectName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/attend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log('Attendance recorded successfully:', result.message);
      // Re-fetch subjects to get updated data from backend
      const updatedSubjectsResponse = await fetch(`${API_BASE_URL}/subjects?userId=${userId}`);
      const updatedSubjectsData = await updatedSubjectsResponse.json();
      setSubjects(updatedSubjectsData);
      setError(null);
    } catch (e) {
      console.error("Error recording attendance:", e);
      setError("Failed to record attendance. Please try again.");
    }
  };

  const handleAddSubjectSubmit = async (e) => {
    e.preventDefault();
    if (!newSubjectName || !newTotalClasses || !newAttendedClasses || !newMinAttendance) {
      setError("Please fill all fields for the new subject.");
      return;
    }
    const total = parseInt(newTotalClasses);
    const attended = parseInt(newAttendedClasses);
    const minAtt = parseInt(newMinAttendance);

    if (isNaN(total) || isNaN(attended) || isNaN(minAtt) || total < 0 || attended < 0 || minAtt < 0 || attended > total || minAtt > 100) {
      setError("Please enter valid numbers for classes and attendance percentage.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId, // Pass userId to link subject to user
          name: newSubjectName,
          totalClasses: total,
          attendedClasses: attended,
          minAttendance: minAtt
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || response.statusText}`);
      }
      const newSubject = await response.json();
      setSubjects([...subjects, newSubject]); // Add the new subject from backend response
      setShowAddSubjectModal(false);
      setNewSubjectName('');
      setNewTotalClasses('');
      setNewAttendedClasses('');
      setNewMinAttendance('75');
      setError(null);
    } catch (e) {
      console.error("Error adding subject:", e);
      setError(`Failed to add subject: ${e.message}. Please try again.`);
    }
  };

  const handleGetBunkPrediction = async () => {
    setAiPredictionLoading(true);
    setAiPredictionResult(null);
    setError(null);

    const selectedSub = subjects.find(s => s._id === selectedSubjectForAI); // Use _id for finding
    if (!selectedSub) {
      setError("Please select a subject for prediction.");
      setAiPredictionLoading(false);
      return;
    }

    const currentAttendance = calculateAttendancePercentage(selectedSub);
    const minRequiredAttendance = selectedSub.minAttendance;

    try {
      const response = await fetch(`${API_BASE_URL}/predict-bunk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectName: selectedSub.name,
          currentAttendance: parseFloat(currentAttendance),
          minRequiredAttendance: minRequiredAttendance,
          hasStrikesOrEmergency: hasStrikesOrEmergency
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      setAiPredictionResult(data.prediction);
      setBengaluruWeather(data.weather || bengaluruWeather); // Update weather if backend sends it
    } catch (e) {
      console.error("Error getting AI prediction:", e);
      setError(`Error getting AI prediction: ${e.message}. Please check your network or try again.`);
    } finally {
      setAiPredictionLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Loading subjects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col font-inter text-gray-800">
      <div className="flex-grow container mx-auto p-4 md:p-8">
        <h1 className="text-4xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-700">
          Your Bunk Tracker Dashboard
        </h1>

        {/* Add New Subject Section */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-blue-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">Manage Your Subjects</h2>
            <button
              onClick={() => setShowAddSubjectModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-full transition duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              + Add New Subject
            </button>
          </div>
          {subjects.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              No subjects added yet. Click "Add New Subject" to get started!
            </p>
          )}
        </div>

        {/* Subjects List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {subjects.map((subject) => (
            <div key={subject._id} className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
              <h3 className="text-xl font-bold text-blue-700 mb-2">{subject.name}</h3>
              <p className="text-gray-600 mb-1">
                Total Classes: <span className="font-semibold">{subject.totalClasses}</span>
              </p>
              <p className="text-gray-600 mb-1">
                Classes Attended: <span className="font-semibold">{subject.attendedClasses}</span>
              </p>
              <p className="text-gray-600 mb-1">
                Total Bunks: <span className="font-bold text-red-500">{subject.totalBunks || 0}</span>
              </p>
              <p className="text-gray-600 mb-1">
                Min. Attendance: <span className="font-semibold">{subject.minAttendance}%</span>
              </p>
              <p className="text-lg font-bold mt-2">
                Current Attendance: <span className={`
                  ${parseFloat(calculateAttendancePercentage(subject)) >= subject.minAttendance ? 'text-green-600' : 'text-red-600'}
                `}>
                  {calculateAttendancePercentage(subject)}%
                </span>
              </p>
              <p className="text-md text-gray-700 mb-4">
                Classes Safe to Bunk: <span className="font-bold text-purple-600">{calculateClassesSafeToBunk(subject)}</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                  onClick={() => handleBunkedClick(subject._id, subject.name)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
                >
                  Bunked Today
                </button>
                <button
                  onClick={() => handleAttendedClick(subject._id, subject.name)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
                >
                  Attended Today
                </button>
                {/* Add Edit/Delete buttons here if desired */}
              </div>
            </div>
          ))}
        </div>

        {/* AI Bunk Prediction Section */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-purple-100">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">AI Bunk Prediction</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="aiSubjectSelect" className="block text-sm font-medium text-gray-700 mb-1">
                Select Subject:
              </label>
              <select
                id="aiSubjectSelect"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                value={selectedSubjectForAI}
                onChange={(e) => setSelectedSubjectForAI(e.target.value)}
              >
                {subjects.length === 0 ? (
                  <option value="">No subjects available</option>
                ) : (
                  subjects.map(sub => (
                    // Corrected line: Comment moved to its own line
                    <option key={sub._id} value={sub._id}>{sub.name}</option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label htmlFor="weatherInfo" className="block text-sm font-medium text-gray-700 mb-1">
                Bengaluru Weather:
              </label>
              <p id="weatherInfo" className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-50 rounded-md shadow-sm">
                {bengaluruWeather}
              </p>
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Are there any city-wide strikes or national emergencies in Bengaluru today?
            </label>
            <div className="mt-2 flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="strikes"
                  value="Yes"
                  checked={hasStrikesOrEmergency === 'Yes'}
                  onChange={(e) => setHasStrikesOrEmergency(e.target.value)}
                />
                <span className="ml-2 text-gray-700">Yes</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="strikes"
                  value="No"
                  checked={hasStrikesOrEmergency === 'No'}
                  onChange={(e) => setHasStrikesOrEmergency(e.target.value)}
                />
                <span className="ml-2 text-gray-700">No</span>
              </label>
            </div>
          </div>
          <button
            onClick={handleGetBunkPrediction}
            disabled={aiPredictionLoading || subjects.length === 0}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {aiPredictionLoading ? 'Getting Advice...' : 'Get Bunk Advice'}
          </button>

          {aiPredictionResult && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-inner">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">AI's Recommendation:</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{aiPredictionResult}</p>
            </div>
          )}
        </div>

        {/* Add Subject Modal */}
        {showAddSubjectModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md mx-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Add New Subject</h2>
              <form onSubmit={handleAddSubjectSubmit}>
                <div className="mb-4">
                  <label htmlFor="subjectName" className="block text-gray-700 text-sm font-bold mb-2">
                    Subject Name:
                  </label>
                  <input
                    type="text"
                    id="subjectName"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-blue-500 focus:border-blue-500"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    placeholder="e.g., Data Structures"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="totalClasses" className="block text-gray-700 text-sm font-bold mb-2">
                    Total Classes:
                  </label>
                  <input
                    type="number"
                    id="totalClasses"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-blue-500 focus:border-blue-500"
                    value={newTotalClasses}
                    onChange={(e) => setNewTotalClasses(e.target.value)}
                    placeholder="e.g., 60"
                    min="0"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="attendedClasses" className="block text-gray-700 text-sm font-bold mb-2">
                    Classes Attended:
                  </label>
                  <input
                    type="number"
                    id="attendedClasses"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-blue-500 focus:border-blue-500"
                    value={newAttendedClasses}
                    onChange={(e) => setNewAttendedClasses(e.target.value)}
                    placeholder="e.g., 50"
                    min="0"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="minAttendance" className="block text-gray-700 text-sm font-bold mb-2">
                    Minimum Attendance %:
                  </label>
                  <input
                    type="number"
                    id="minAttendance"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-blue-500 focus:border-blue-500"
                    value={newMinAttendance}
                    onChange={(e) => setNewMinAttendance(e.target.value)}
                    placeholder="e.g., 75"
                    min="0"
                    max="100"
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 shadow-md"
                  >
                    Add Subject
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddSubjectModal(false);
                      setNewSubjectName('');
                      setNewTotalClasses('');
                      setNewAttendedClasses('');
                      setNewMinAttendance('75');
                      setError(null); // Clear errors on close
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 shadow-md"
                  >
                    Cancel
                  </button>
                </div>
                {error && <p className="text-red-500 text-xs italic mt-4 text-center">{error}</p>}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BunkTracker;

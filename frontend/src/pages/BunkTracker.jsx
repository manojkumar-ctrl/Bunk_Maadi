import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { toast } from 'react-hot-toast';
import Markdown from 'react-markdown';

// If you prefer env-based base URL, use that; fallback to localhost
axios.defaults.baseURL = import.meta.env.BACKEND_URL || 'http://localhost:5000/api';
const API_BASE_URL = import.meta.env.BACKEND_URL || 'http://localhost:5000/api';

function BunkTracker() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newTotalClasses, setNewTotalClasses] = useState('');
  const [newAttendedClasses, setNewAttendedClasses] = useState('');
  const [newMinAttendance, setNewMinAttendance] = useState('75');
  const [newSubjectCredits, setNewSubjectCredits] = useState('');

  // AI Bunk Prediction State
  const [aiPredictionLoading, setAiPredictionLoading] = useState(false);
  const [aiPredictionResult, setAiPredictionResult] = useState(null);
  const [aiRecommendation, setAiRecommendation] = useState(null); // 'yes' | 'no' | 'caution'
  const [selectedSubjectForAI, setSelectedSubjectForAI] = useState('');

  // Clerk auth
  const { userId, getToken, isLoaded } = useAuth();

  // Removed automatic welcome toast on navigation to BunkTracker

  // Fetch subjects for logged-in user
  useEffect(() => {
    if (!isLoaded || !userId) {
      setLoading(false);
      return;
    }

    const fetchSubjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        const response = await fetch(`${API_BASE_URL}/subjects`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSubjects(data);
        if (data.length > 0) {
          setSelectedSubjectForAI(data[0]._id);
        }
      } catch (err) {
        console.error('Error fetching subjects:', err);
        setError('Failed to load subjects. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [userId, isLoaded, getToken]);

  const calculateAttendancePercentage = (subject) => {
    const total = Number(subject.totalClasses || 0);
    const attended = Number(subject.attendedClasses || 0);
    if (total === 0) return '0.00';
    return ((attended / total) * 100).toFixed(2);
  };

  const calculateClassesSafeToBunk = (subject) => {
    if (
      typeof subject.totalClasses !== 'number' ||
      typeof subject.attendedClasses !== 'number' ||
      typeof subject.credits !== 'number'
    )
      return 0;

    const maxBunks = subject.credits * 2;
    const classesBunked = subject.totalClasses - subject.attendedClasses;
    const safeBunks = maxBunks - classesBunked;

    return Math.max(0, safeBunks);
  };

  // --- Updated Bunk handler: optimistic dispatch + include subject & date fields ---
  const handleBunkedClick = async (subjectId) => {
    setError(null);

    // Find the subject in local state (for optimistic UI and payload)
    const subject = subjects.find((s) => s._id === subjectId) || null;
    const subjectName = subject ? subject.name : 'Unknown Subject';
    const now = new Date();
    const nowIso = now.toISOString();

    // Optimistic: notify Logger immediately so UI updates even if backend fails
    const optimisticDetail = {
      subjectId,
      subjectName,
      bunkDate: nowIso,
    };
    window.dispatchEvent(new CustomEvent('bunkRecorded', { detail: optimisticDetail }));

    // Build the full payload — include BOTH modern keys and legacy ones your server expects
    const payload = {
      subjectId,
      subjectName,
      bunkDate: nowIso,
      // legacy fields expected by original backend handler:
      subject: subjectName, // <-- original server expects `subject`
      date: nowIso,         // <-- original server expects `date`
      userId: userId || null,
      attendedClasses:
        subject && subject.attendedClasses !== undefined
          ? Number(subject.attendedClasses) + 1
          : null,
      totalClasses:
        subject && subject.totalClasses !== undefined ? Number(subject.totalClasses) : null,
      minAttendance:
        subject && subject.minAttendance !== undefined ? subject.minAttendance : null,
      credits: subject && subject.credits !== undefined ? subject.credits : null,
    };

    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/bunk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Read body regardless (helps surface server validation message)
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error('Server rejected bunk POST:', res.status, body);
        const serverMsg = body.message || body.error || JSON.stringify(body) || res.statusText;
        throw new Error(`HTTP error! status: ${res.status}. ${serverMsg}`);
      }

      // Success path: optionally refresh subjects to show canonical counts
      console.log('Bunk recorded on server:', body);
      toast.success(`Bunk marked for ${subjectName}`);
      try {
        const updatedRes = await fetch(`${API_BASE_URL}/subjects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (updatedRes.ok) {
          const updatedData = await updatedRes.json();
          setSubjects(updatedData);
        }
      } catch (refreshErr) {
        console.warn('Could not refresh subjects after bunk:', refreshErr);
      }
    } catch (err) {
      // Keep optimistic Logger entry; report backend failure to user
      console.error('Error recording bunk:', err);
      setError(`Failed to record bunk on server: ${err.message}`);
      toast.error('Failed to record bunk');
    }
  };

  // Add subject
  const handleAddSubjectSubmit = async (e) => {
    e.preventDefault();
    if (!newSubjectName || !newTotalClasses || !newAttendedClasses || !newMinAttendance) {
      setError('Please fill all fields for the new subject.');
      return;
    }
    const total = parseInt(newTotalClasses, 10);
    const attended = parseInt(newAttendedClasses, 10);
    const minAtt = parseInt(newMinAttendance, 10);

    if (
      isNaN(total) ||
      isNaN(attended) ||
      isNaN(minAtt) ||
      total < 0 ||
      attended < 0 ||
      minAtt < 0 ||
      attended > total ||
      minAtt > 100
    ) {
      setError('Please enter valid numbers for classes and attendance percentage.');
      return;
    }

    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/subjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newSubjectName,
          totalClasses: total,
          attendedClasses: attended,
          minAttendance: minAtt,
          credits: parseInt(newSubjectCredits, 10) || 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorData.message || response.statusText}`
        );
      }

      const newSubject = await response.json();
      setSubjects((prev) => [...prev, newSubject]);
      setShowAddSubjectModal(false);
      setNewSubjectName('');
      setNewTotalClasses('');
      setNewAttendedClasses('');
      setNewMinAttendance('75');
      setNewSubjectCredits('');
      setError(null);
      toast.success('Subject added');
    } catch (e) {
      console.error('Error adding subject:', e);
      setError(`Failed to add subject: ${e.message}. Please try again.`);
      toast.error('Failed to add subject');
    }
  };

  // AI prediction
  const handleGetBunkPrediction = async () => {
    setAiPredictionLoading(true);
    setAiPredictionResult(null);
    setAiRecommendation(null);
    setError(null);

    const selectedSub = subjects.find((s) => s._id === selectedSubjectForAI);
    if (!selectedSub) {
      setError('Please select a subject for prediction.');
      setAiPredictionLoading(false);
      return;
    }

    const currentAttendance = calculateAttendancePercentage(selectedSub);
    const minRequiredAttendance = selectedSub.minAttendance;
    const safeBunksRemaining = calculateClassesSafeToBunk(selectedSub);

    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/predict-bunk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          subjectName: selectedSub.name,
          currentAttendance: parseFloat(currentAttendance),
          minRequiredAttendance: minRequiredAttendance,
          maxBunkable: safeBunksRemaining,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorData.message || response.statusText}`
        );
      }

      const data = await response.json();
      const predictionText = String(data.prediction || '');
      setAiPredictionResult(predictionText);

      // classify tone for styling
      const textLc = predictionText.toLowerCase();
      let tone = 'caution';
      if (safeBunksRemaining <= 0) {
        tone = 'no';
      }
      if (/(^|\b)(no|do not|don't)\b.*bunk/.test(textLc) || /\bdo not bunk\b/.test(textLc)) {
        tone = 'no';
      } else if (/\byes\b.*bunk/.test(textLc) || /\bcan bunk\b/.test(textLc) || /\bsafe(ly)? to bunk\b/.test(textLc)) {
        tone = 'yes';
      }
      setAiRecommendation(tone);
    } catch (e) {
      console.error('Error getting AI prediction:', e);
      setError(`Error getting AI prediction: ${e.message}. Please check your network or try again.`);
    } finally {
      setAiPredictionLoading(false);
    }
  };

  // Delete subject
  const handleDeleteSubject = async (subjectId) => {
    if (!window.confirm('Are you sure you want to delete this subject? This action cannot be undone.')) {
      return;
    }
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/subjects/${subjectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setSubjects((prev) => prev.filter((subject) => subject._id !== subjectId));
      setError(null);

      // Notify Logger to refresh/optimistically remove entries for this subject
      try {
        const deletedSubject = subjects.find((s) => s._id === subjectId);
        if (deletedSubject) {
          window.dispatchEvent(
            new CustomEvent('bunkRecorded', {
              detail: { subjectName: deletedSubject.name, bunkDate: Date.now(), deleted: true },
            })
          );
        } else {
          // generic trigger so Logger re-fetches
          window.dispatchEvent(new CustomEvent('bunkRecorded'));
        }
      } catch (_) {}
      toast.success('Subject deleted');
    } catch (e) {
      console.error('Error deleting subject:', e);
      setError('Failed to delete subject. Please try again.');
      toast.error('Failed to delete subject');
    }
  };

  // Auth/UI guards
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen  bg-gradient-to-br from-blue-50 to-blue-100">
        <p className="text-xl text-gray-700">Loading authentication...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <p className="text-xl text-gray-700">Please sign in to view this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Loading subjects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen  bg-gradient-to-br from-blue-50 to-blue-100">
        <p className="text-xl text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className=" bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen flex flex-col font-inter text-gray-800 ">
      <div className="flex-grow container mx-auto p-4 md:p-8">
        <h1 className="text-4xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-700">
          Bunk Tracker Dashboard
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
            <div
              key={subject._id}
              className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition duration-300 transform hover:-translate-y-1 relative"
            >
              <button
                onClick={() => handleDeleteSubject(subject._id)}
                className="absolute top-3 right-3 text-red-500 hover:text-red-700 transition duration-200"
                aria-label="Delete Subject"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>

              <h3 className="text-xl font-bold text-blue-700 mb-2">{subject.name}</h3>
              <p className="text-gray-600 mb-1">
                Classes Conducted: <span className="font-semibold">{subject.totalClasses}</span>
              </p>
              <p className="text-gray-600 mb-1">
                Classes Attended: <span className="font-semibold">{subject.attendedClasses}</span>
              </p>
              <p className="text-lg font-bold mt-2">
                Current Attendance:{' '}
                <span
                  className={`${
                    parseFloat(calculateAttendancePercentage(subject)) >= subject.minAttendance
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {calculateAttendancePercentage(subject)}%
                </span>
              </p>
              <p className="text-md text-gray-700 mb-4">
                Classes You Can Bunk (at max) :{' '}
                <span className="font-bold text-purple-600">
                  {calculateClassesSafeToBunk(subject)}
                </span>
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                  onClick={() => handleBunkedClick(subject._id)}
                  className="flex-1 bg-red-500 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
                >
                  Bunked Today
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* AI Bunk Prediction Section */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-purple-100">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">AI Bunk Prediction</h2>
          <div className="mb-4">
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
                subjects.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name}
                  </option>
                ))
              )}
            </select>
          </div>

          

          <button
            onClick={handleGetBunkPrediction}
            disabled={aiPredictionLoading || subjects.length === 0}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {aiPredictionLoading ? 'Getting Advice...' : 'Get Bunk Advice'}
          </button>

          {aiPredictionResult && (
            <div
              className={
                `mt-6 p-4 rounded-lg shadow-inner border ` +
                (aiRecommendation === 'yes'
                  ? 'bg-green-50 border-green-200'
                  : aiRecommendation === 'no'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-yellow-50 border-yellow-200')
              }
            >
              <h3 className="text-lg font-semibold mb-2">
                {aiRecommendation === 'yes' && <span className="text-green-800">AI's Recommendation: Yes</span>}
                {aiRecommendation === 'no' && <span className="text-red-800">AI's Recommendation: No</span>}
                {aiRecommendation === 'caution' && <span className="text-yellow-800">AI's Recommendation</span>}
              </h3>
              <div className="mt-3 text-sm text-slate-700">
                <Markdown>{aiPredictionResult}</Markdown>
              </div>
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
                    Classes Conducted:
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

                <div className="mb-4">
                  <label htmlFor="credits" className="block text-gray-700 text-sm font-bold mb-2">
                    Subject Credits:
                  </label>
                  <input
                    type="number"
                    id="credits"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-blue-500 focus:border-blue-500"
                    value={newSubjectCredits}
                    onChange={(e) => setNewSubjectCredits(e.target.value)}
                    placeholder="e.g., 4"
                    min="1"
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
                      setNewSubjectCredits('');
                      setNewMinAttendance('75');
                      setError(null);
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
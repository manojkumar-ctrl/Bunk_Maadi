import React, { useState, useEffect } from 'react';

const BunkTracker = () => {
  const BUNK_RECORDS_KEY = 'bunkRecords';
  const USER_COINS_KEY = 'userCoins';
  const USER_ID_KEY = 'currentUserId';
  const COINS_PER_BUNK = 50;

  const [bunkedToday, setBunkedToday] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [earnedCoinsToday, setEarnedCoinsToday] = useState(0);
  const [userCoins, setUserCoins] = useState(0);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentMonthYear, setCurrentMonthYear] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const userId = (() => {
    let id = localStorage.getItem(USER_ID_KEY);
    if (!id) {
      id = `guest_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(USER_ID_KEY, id);
    }
    return id;
  })();

  const subjectsList = [
    "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science",
    "History", "Geography", "English", "Hindi", "Sanskrit",
    "Physical Education", "Economics", "Accountancy", "Business Studies", "Arts"
  ];

  const getBunkRecords = () => {
    try {
      const records = localStorage.getItem(BUNK_RECORDS_KEY);
      return records ? JSON.parse(records) : [];
    } catch (error) {
      console.error("Error getting bunk records from localStorage:", error);
      return [];
    }
  };

  const saveBunkRecords = (records) => {
    try {
      localStorage.setItem(BUNK_RECORDS_KEY, JSON.stringify(records));
    } catch (error) {
      console.error("Error saving bunk records to localStorage:", error);
    }
  };

  const addBunkRecord = (date, subjects, currentUserId) => {
    const records = getBunkRecords();
    records.push({ date, subjects, userId: currentUserId });
    saveBunkRecords(records);
  };

  const getCurrentUserCoins = () => {
    try {
      const coins = localStorage.getItem(USER_COINS_KEY);
      return coins ? parseInt(coins, 10) : 0;
    } catch (error) {
      console.error("Error getting user coins from localStorage:", error);
      return 0;
    }
  };

  const addCoins = (amount) => {
    const currentCoins = getCurrentUserCoins();
    const newCoins = currentCoins + amount;
    try {
      localStorage.setItem(USER_COINS_KEY, newCoins.toString());
    } catch (error) {
      console.error("Error adding coins to localStorage:", error);
    }
  };

  const refreshAllData = () => {
    setUserCoins(getCurrentUserCoins());
    updateLeaderboard();
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  const handleBunkTodayClick = (didBunk) => {
    setBunkedToday(didBunk);
    if (!didBunk) {
      setShowNotification(true);
      setEarnedCoinsToday(0);
      setTimeout(() => {
        setShowNotification(false);
        setBunkedToday(null);
        setSelectedSubjects([]);
      }, 2000);
    }
  };

  const handleSubjectChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      setSelectedSubjects(prev => [...prev, value]);
    } else {
      setSelectedSubjects(prev => prev.filter(subject => subject !== value));
    }
  };

  const handleConfirmBunk = () => {
    if (selectedSubjects.length === 0) {
      alert("Please select at least one subject you bunked.");
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    addBunkRecord(today, selectedSubjects, userId);

    const coinsGained = selectedSubjects.length * COINS_PER_BUNK;
    addCoins(coinsGained);
    setEarnedCoinsToday(coinsGained);

    setShowNotification(true);
    refreshAllData();

    setTimeout(() => {
      setShowNotification(false);
      setBunkedToday(null);
      setSelectedSubjects([]);
    }, 3000);
  };

  const updateLeaderboard = () => {
    const allRecords = getBunkRecords();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    setCurrentMonthYear(
      now.toLocaleString('en-US', { month: 'long', year: 'numeric' })
    );

    const monthlyBunks = {};
    allRecords.forEach(record => {
      const recordDate = new Date(record.date);
      if (recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear) {
        const recordUserId = record.userId;
        if (!monthlyBunks[recordUserId]) {
          monthlyBunks[recordUserId] = { totalBunks: 0, totalCoins: 0 };
        }
        monthlyBunks[recordUserId].totalBunks += record.subjects.length;
        monthlyBunks[recordUserId].totalCoins += record.subjects.length * COINS_PER_BUNK;
      }
    });

    const sortedLeaderboard = Object.entries(monthlyBunks)
      .map(([id, data]) => ({
        userId: id,
        totalBunks: data.totalBunks,
        totalCoins: data.totalCoins,
        displayName: id === userId ? `You (Guest ${id.substring(6, 10)})` : `Guest ${id.substring(6, 10)}`
      }))
      .sort((a, b) => b.totalBunks - a.totalBunks)
      .slice(0, 5);

    setLeaderboardData(sortedLeaderboard);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="bg-indigo-600 text-white p-4 flex justify-between items-center rounded-lg mb-8">
        <h1 className="text-2xl font-bold">Bunk Tracker</h1>
        <div className="flex items-center bg-white text-indigo-800 px-4 py-2 rounded-full">
          <span className="font-bold text-lg">💰 {userCoins}</span>
          <span className="ml-1 text-sm">Coins</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow w-full md:w-1/2">
          <h2 className="text-xl font-bold text-center mb-4">Did you bunk today?</h2>
          {bunkedToday === null && (
            <div className="text-center space-x-4">
              <button onClick={() => handleBunkTodayClick(true)} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg">Yes</button>
              <button onClick={() => handleBunkTodayClick(false)} className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg">No</button>
            </div>
          )}

          {bunkedToday && (
            <div className="mt-4">
              <p className="mb-2">Select subjects:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {subjectsList.map(subject => (
                  <label key={subject} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={subject}
                      checked={selectedSubjects.includes(subject)}
                      onChange={handleSubjectChange}
                      className="accent-indigo-600"
                    />
                    <span>{subject}</span>
                  </label>
                ))}
              </div>
              <button onClick={handleConfirmBunk} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">Confirm</button>
            </div>
          )}

          {showNotification && (
            <div className={`mt-4 p-4 text-center rounded-lg ${earnedCoinsToday > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-800'}`}>
              {earnedCoinsToday > 0 ? `You earned ${earnedCoinsToday} coins today!` : `No bunks recorded today.`}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow w-full md:w-1/2">
          <h2 className="text-xl font-bold text-center mb-4">Top Bunkers of {currentMonthYear}</h2>
          {leaderboardData.length === 0 ? (
            <p className="text-center text-gray-500">No data this month.</p>
          ) : (
            <ul className="space-y-3">
              {leaderboardData.map((entry, index) => (
                <li key={entry.userId} className={`p-3 rounded-lg flex justify-between items-center ${entry.userId === userId ? 'bg-indigo-50 ring-2 ring-indigo-300' : 'bg-gray-100'}`}>
                  <span className="font-semibold">#{index + 1} {entry.displayName}</span>
                  <div className="text-right">
                    <p>{entry.totalBunks} Bunks</p>
                    <p className="text-green-600">{entry.totalCoins} Coins</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default BunkTracker;
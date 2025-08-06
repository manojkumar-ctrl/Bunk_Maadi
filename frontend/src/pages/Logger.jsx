import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Assuming your backend URL is accessible here
const API_BASE_URL = 'http://localhost:5000/api';
// IMPORTANT: Replace 'student123' with a dynamic userId from your authentication system
const userId = 'student123';

const Logger = () => {
  const [groupedBunks, setGroupedBunks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBunkHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/bunk-history/${userId}`);
        
        // Group bunks by date
        const bunksByDate = response.data.reduce((acc, bunk) => {
          // Format the date to dd/mm/yyyy
          const date = new Date(bunk.bunkDate).toLocaleDateString('en-GB'); 
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(bunk.subjectName);
          return acc;
        }, {});

        setGroupedBunks(bunksByDate);
      } catch (err) {
        console.error("Error fetching bunk history:", err);
        setError('Failed to load bunk history. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchBunkHistory();
  }, [userId]);

  // Get a sorted array of dates (keys) from the groupedBunks object
  const sortedDates = Object.keys(groupedBunks).sort((a, b) => {
    const [aDay, aMonth, aYear] = a.split('/').map(Number);
    const [bDay, bMonth, bYear] = b.split('/').map(Number);
    const dateA = new Date(aYear, aMonth - 1, aDay);
    const dateB = new Date(bYear, bMonth - 1, bDay);
    return dateB - dateA;
  });


  // Function to generate the Google Calendar link
  const getCalendarLink = (date, subjects) => {
    const [day, month, year] = date.split('/').map(part => part.padStart(2, '0'));
    const formattedDate = `${year}${month}${day}`;
    const title = `Bunked Classes`;
    const description = `Subjects bunked: ${subjects.join(', ')}`;
    
    const link = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formattedDate}/${formattedDate}&details=${encodeURIComponent(description)}&sf=true&output=xml`;
    return link;
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Loading bunk history...</p>
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
    <div className="container mx-auto p-4 md:p-8 min-h-screen bg-gray-100">
      <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-800">Your Bunk History</h1>
      {sortedDates.length === 0 ? (
        <p className="text-center text-gray-500 py-4">No bunks recorded yet.</p>
      ) : (
        <div className="bg-white shadow-lg rounded-xl p-6">
          <ul className="space-y-6">
            {sortedDates.map(date => (
              <li key={date} className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Bunks on {date}</h2>
                  <a 
                    href={getCalendarLink(date, groupedBunks[date])} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-500 hover:text-blue-700 transition duration-200 text-sm font-semibold"
                  >
                    Add to Calendar
                  </a>
                </div>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  {groupedBunks[date].map((subjectName, index) => (
                    <li key={index} className="text-lg text-gray-700">
                      {subjectName}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Logger;
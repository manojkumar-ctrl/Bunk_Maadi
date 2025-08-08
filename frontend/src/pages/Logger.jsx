import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

const API_BASE_URL = import.meta.env.BACKEND_URL || 'http://localhost:5000/api';

const Logger = () => {
  const { userId, getToken, isLoaded } = useAuth();
  const [groupedBunks, setGroupedBunks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBunkHistory = useCallback(async () => {
    if (!isLoaded || !userId) {
      setGroupedBunks({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await axios.get(`${API_BASE_URL}/bunk-history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = Array.isArray(res.data) ? res.data : [];

      // Group bunks by date (robust to different backend field names)
      const bunksByDate = data.reduce((acc, bunk) => {
        const dateVal = bunk.bunkDate || bunk.date || bunk.createdAt || bunk.created_at;
        const dateObj = dateVal ? new Date(dateVal) : new Date();
        const dateKey = dateObj.toLocaleDateString('en-GB');

        // subject name: try multiple shapes (bunk.subjectName, bunk.subject.name, bunk.subject)
        const subjectName =
          bunk.subjectName ||
          (bunk.subject && (bunk.subject.name || bunk.subject.subjectName)) ||
          bunk.subject ||
          'Unknown Subject';

        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(subjectName);
        return acc;
      }, {});

      setGroupedBunks(bunksByDate);
    } catch (err) {
      console.error('Error fetching bunk history:', err);
      setError('Failed to load bunk history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userId, isLoaded, getToken]);

  // initial fetch
  useEffect(() => {
    fetchBunkHistory();
  }, [fetchBunkHistory]);

  // listen for external events (dispatched by BunkTracker) to refresh and optimistic update
  useEffect(() => {
    const handler = (e) => {
      const detail = e?.detail;

      if (detail) {
        try {
          const dateKey = new Date(detail.bunkDate || Date.now()).toLocaleDateString('en-GB');

          setGroupedBunks((prev) => {
            const copy = { ...prev };
            const existing = Array.isArray(copy[dateKey]) ? copy[dateKey] : [];

            // Optionally dedupe: only add if subject not already present for that date
            const subjectToAdd = detail.subjectName || 'Unknown Subject';
            const alreadyPresent = existing.includes(subjectToAdd);

            if (!alreadyPresent) {
              copy[dateKey] = [...existing, subjectToAdd];
            } else {
              // If already present, keep as-is
              copy[dateKey] = existing;
            }

            return copy;
          });
        } catch (err) {
          console.warn('Failed optimistic update from bunkRecorded event', err);
        }

        // Re-sync with backend to get canonical data (recommended)
        fetchBunkHistory();
      } else {
        // If the event had no detail, just refresh
        fetchBunkHistory();
      }
    };

    window.addEventListener('bunkRecorded', handler);
    return () => window.removeEventListener('bunkRecorded', handler);
  }, [fetchBunkHistory]);

  // Sort dates (desc)
  const sortedDates = Object.keys(groupedBunks).sort((a, b) => {
    const [aDay, aMonth, aYear] = a.split('/').map(Number);
    const [bDay, bMonth, bYear] = b.split('/').map(Number);
    return new Date(bYear, bMonth - 1, bDay) - new Date(aYear, aMonth - 1, aDay);
  });

  const getCalendarLink = (date, subjects) => {
    const [day, month, year] = date.split('/').map(part => part.padStart(2, '0'));
    const formattedDate = `${year}${month}${day}`;
    const title = 'Bunked Classes';
    const description = `Subjects bunked: ${subjects.join(', ')}`;
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formattedDate}/${formattedDate}&details=${encodeURIComponent(description)}&sf=true&output=xml`;
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Loading authentication...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Please sign in to view your bunk history.</p>
      </div>
    );
  }

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

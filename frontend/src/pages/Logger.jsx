import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

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

      const bunksByDate = data.reduce((acc, bunk) => {
        const dateVal = bunk.bunkDate || bunk.date || bunk.createdAt || bunk.created_at;
        const dateObj = dateVal ? new Date(dateVal) : new Date();
        const dateKey = dateObj.toLocaleDateString('en-GB');

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

  useEffect(() => {
    fetchBunkHistory();
  }, [fetchBunkHistory]);

  useEffect(() => {
    const handler = (e) => {
      const detail = e?.detail;
      fetchBunkHistory();

      if (!detail) return;

      if (!detail.deleted) {
        try {
          const dateKey = new Date(detail.bunkDate || Date.now()).toLocaleDateString('en-GB');
          setGroupedBunks((prev) => {
            const copy = { ...prev };
            const existing = Array.isArray(copy[dateKey]) ? copy[dateKey] : [];
            const subjectToAdd = detail.subjectName || 'Unknown Subject';
            if (!existing.includes(subjectToAdd)) {
              copy[dateKey] = [...existing, subjectToAdd];
            }
            return copy;
          });
        } catch (err) {
          console.warn('Failed optimistic add in Logger', err);
        }
      }
    };

    window.addEventListener('bunkRecorded', handler);
    return () => window.removeEventListener('bunkRecorded', handler);
  }, [fetchBunkHistory]);

  const sortedDates = Object.keys(groupedBunks).sort((a, b) => {
    const [aDay, aMonth, aYear] = a.split('/').map(Number);
    const [bDay, bMonth, bYear] = b.split('/').map(Number);
    return new Date(bYear, bMonth - 1, bDay) - new Date(aYear, aMonth - 1, aDay);
  });

  const getCalendarLink = (date, subjects) => {
    const [day, month, year] = date.split('/').map((part) => part.padStart(2, '0'));
    const formattedDate = `${year}${month}${day}`;
    const title = subjects.length === 1 ? `Bunked: ${subjects[0]}` : 'Bunked Classes';
    const description = subjects.length === 1
      ? `Subject bunked: ${subjects[0]}`
      : `Subjects bunked: ${subjects.join(', ')}`;
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title
    )}&dates=${formattedDate}/${formattedDate}&details=${encodeURIComponent(
      description
    )}&sf=true&output=xml`;
  };

  const LoaderScreen = ({ message }) => (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <p className="text-xl text-gray-700 font-medium">{message}</p>
    </div>
  );

  if (!isLoaded) return <LoaderScreen message="Loading authentication..." />;
  if (!userId) return <LoaderScreen message="Please sign in to view your bunk history." />;
  if (loading) return <LoaderScreen message="Loading bunk history..." />;
  if (error) return <LoaderScreen message={`Error: ${error}`} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-8">
      <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-800 drop-shadow-sm">
        Your Bunk History
      </h1>
      {sortedDates.length === 0 ? (
        <p className="text-center text-gray-500 py-4">No bunks recorded yet.</p>
      ) : (
        <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8 max-w-4xl mx-auto">
          <ul className="space-y-6">
            {sortedDates.map(date => (
              <li
                key={date}
                className="border-b border-gray-200 pb-4 last:border-none"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <h2 className="text-xl font-semibold text-gray-800">
                    📅 Bunks on {date}
                  </h2>
                  <a
                    href={getCalendarLink(date, groupedBunks[date])}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:bg-blue-700 transition duration-200 text-center"
                  >
                    Add to Calendar
                  </a>
                </div>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  {groupedBunks[date].map((subjectName, index) => (
                    <li key={index} className="text-gray-700 text-lg">
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

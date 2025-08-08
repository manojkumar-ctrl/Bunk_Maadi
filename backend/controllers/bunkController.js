// backend/controllers/bunkController.js
const Bunk = require('../models/Bunk');

const recordBunk = async (req, res) => {
  try {
    // Log incoming request for debugging
    console.log('--- /api/bunk POST received ---');
    console.log('headers:', req.headers);
    console.log('body:', req.body);

    // Support multiple incoming shapes:
    // - { subject: "Data Structures", date: "2025-08-01T..." }
    // - { subjectName: "Data Structures", bunkDate: "..." }
    // - { subjectId: "abc123", subjectName: "Data Structures", bunkDate: "..." }
    const {
      subject,
      subjectName,
      subjectId,
      date,
      bunkDate,
      userId: bodyUserId,
    } = req.body || {};

    // prefer authenticated user id from middleware; fallback to body.userId if present
    const userId = req.auth?.userId || bodyUserId;

    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Determine a subject string to save
    // If subjectId is provided and subjectName is not, we store subjectId (string).
    const subjectValue = subject || subjectName || subjectId;
    if (!subjectValue) {
      return res.status(400).json({ message: 'subject is required in request body' });
    }

    // Determine date to store
    const dateValue = date || bunkDate || Date.now();
    const parsedDate = dateValue ? new Date(dateValue) : new Date();

    const bunk = new Bunk({
      subject: subjectValue,
      date: parsedDate,
      userId, // matches models/Bunk.js
    });

    await bunk.save();

    res.status(201).json({ message: 'Bunk recorded', bunk });
  } catch (err) {
    console.error('recordBunk error:', err);
    // If it's a Mongoose validation error, surface useful info
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: err.message });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { recordBunk };

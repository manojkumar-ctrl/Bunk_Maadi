// backend/controllers/bunkController.js
const Bunk = require('../models/Bunk');
const Subject = require('../models/Subject');

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

    // Attempt to find and update the corresponding subject for this user
    try {
      // Prefer matching by explicit subjectId if provided, else by name
      let subjectDoc = null;
      if (subjectId) {
        subjectDoc = await Subject.findOne({ _id: subjectId, user: userId });
      }
      if (!subjectDoc && (subjectName || subject)) {
        const nameToFind = subjectName || subject;
        subjectDoc = await Subject.findOne({ name: nameToFind, user: userId });
      }

      if (subjectDoc) {
        // On bunk: classes conducted +1; attendance stays same (didn't attend)
        subjectDoc.totalClasses = Number(subjectDoc.totalClasses || 0) + 1;
        // attendedClasses unchanged
        // totalBunks +1 and history append
        subjectDoc.totalBunks = Number(subjectDoc.totalBunks || 0) + 1;
        subjectDoc.bunkHistory = subjectDoc.bunkHistory || [];
        subjectDoc.bunkHistory.push({ date: parsedDate, type: 'bunk' });

        // Recompute derived fields
        const total = Number(subjectDoc.totalClasses) || 0;
        const attended = Number(subjectDoc.attendedClasses) || 0;
        subjectDoc.attendancePercentage = total > 0 ? Number(((attended / total) * 100).toFixed(2)) : 0;
        const classesBunked = Math.max(0, total - attended);
        subjectDoc.maxBunkable = Math.max(0, (Number(subjectDoc.credits) * 2) - classesBunked);

        await subjectDoc.save();
      }
    } catch (subjectUpdateErr) {
      console.warn('Could not update subject after bunk:', subjectUpdateErr.message);
    }

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

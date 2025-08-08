// backend/controllers/history.js
const Bunk = require('../models/Bunk');

const getBunkHistory = async (req, res) => {
  try {
    console.log('GET /api/bunk-history called');
    console.log('req.auth present?', !!req.auth);
    console.log('req.auth.userId:', req.auth?.userId);
    console.log('Authorization header (first 50 chars):', req.headers.authorization?.slice(0,50) || 'none');

    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ message: 'Not authenticated (req.auth.userId missing).' });
    }

    const userId = req.auth.userId;

    // Query stored using "user" field (match your models). Adjust if you use userId.
    const history = await Bunk.find({ userId: userId }).sort({ date: -1 }).limit(100).lean();

    // Normalize shape so frontend doesn't need to guess field names
    const normalized = history.map(h => ({
      id: h._id,
      bunkDate: h.date || h.bunkDate || h.createdAt,
      subjectName: h.subject || h.subjectName || h.title || 'Unknown Subject',
      status: h.status || 'BUNKED'
    }));

    console.log(`Returning ${normalized.length} items for user ${userId}`);
    return res.status(200).json(normalized);
  } catch (err) {
    console.error('getBunkHistory error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getBunkHistory };

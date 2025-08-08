// middleware/requireAuth.js
const { requireAuth } = require('@clerk/express');

module.exports = requireAuth({
  onError: (err, req, res, next) => {
    console.error('Auth error:', err.message || err);
    res.status(401).json({ message: 'Unauthorized' });
  }
});

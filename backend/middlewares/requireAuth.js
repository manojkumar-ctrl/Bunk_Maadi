// backend/middlewares/requireAuth.js
const { requireAuth } = require('@clerk/express');

module.exports = (req, res, next) => {
  // get a Clerk middleware instance
  const clerkMiddleware = requireAuth();

  // call clerk middleware and handle an error via the callback
  clerkMiddleware(req, res, (err) => {
    if (err) {
      // log the failing route + method and Clerk error
      console.error(`Auth failed: ${req.method} ${req.originalUrl} —`, err);
      return res.status(401).json({ message: 'Unauthorized' });
    }
    // success — continue down the middleware chain
    next();
  });
};

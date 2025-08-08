// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const requireAuth = require('./middlewares/requireAuth'); // your middleware file

// Routes
const subjectRoutes = require('./routes/subjectRoutes');
const bunkRoutes = require('./routes/bunkRoutes');
const aiRoutes = require('./routes/aiRoutes');

dotenv.config();
connectDB();

const app = express();

// JSON parser
app.use(express.json());

// ---- CORS ----
// Allow your frontend + Authorization and x-user-id header
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-user-id',
    'X-Requested-With',
    'Accept',
    'Origin'
  ]
};

// Apply CORS for all routes
app.use(cors(corsOptions));

// Make sure OPTIONS preflight requests are answered with proper headers
app.options('*', cors(corsOptions)); // allow CORS preflight for all routes

// Optional: simple logger so you can see requests (remove in prod)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request:', req.path, 'Requested headers:', req.headers['access-control-request-headers']);
  }
  next();
});

// NOTE: handle OPTIONS quickly before auth rejects them
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204); // no content for preflight
  }
  next();
});

// FORCE auth for all /api routes and attach req.auth
// Your middleware exports a middleware function (module.exports = requireAuth({...}))
// so we use it directly (don't call it again)
app.use('/api', requireAuth);

// Mount routes (they will run only for authenticated requests)
app.use('/api/subjects', subjectRoutes);
app.use('/api', bunkRoutes);
app.use('/api', aiRoutes);

app.get('/', (req, res) => res.send('Bunk Maadi API is running...'));

// Generic error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

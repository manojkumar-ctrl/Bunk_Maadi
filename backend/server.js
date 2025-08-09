// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const requireAuth = require('./middlewares/requireAuth');
const { oauthCallback } = require('./controllers/calendarController');

// Routes
const subjectRoutes = require('./routes/subjectRoutes');
const bunkRoutes = require('./routes/bunkRoutes');
const aiRoutes = require('./routes/aiRoutes');
const calendarRoutes = require('./routes/calendarRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Always allow all origins
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 'Authorization', 'x-user-id',
    'X-Requested-With', 'Accept', 'Origin'
  ]
}));

// Handle OPTIONS requests
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Public OAuth callback
app.get('/api/calendar/oauth2callback', oauthCallback);

// Require auth for /api routes
app.use('/api', requireAuth);

// Mount routes
app.use('/api/subjects', subjectRoutes);
app.use('/api', bunkRoutes);
app.use('/api', aiRoutes);
app.use('/api', calendarRoutes);

app.get('/', (req, res) => res.send('Bunk Maadi API is running...'));

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

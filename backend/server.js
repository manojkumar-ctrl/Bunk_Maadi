// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const subjectRoutes = require('./routes/subjectRoutes');
const bunkRoutes = require('./routes/bunkRoutes');
const aiRoutes = require('./routes/aiRoutes');

dotenv.config(); // Load environment variables from .env file
connectDB(); // Connect to MongoDB database

const app = express();

// Middleware
app.use(express.json()); // Body parser for JSON data (allows req.body)
app.use(cors()); // Enable CORS for all origins (important for frontend-backend communication)

// Route Handlers
// All routes will be prefixed with /api
app.use('/api/subjects', subjectRoutes); // Routes for subject management
app.use('/api', bunkRoutes);             // Routes for bunking, attendance, and leaderboard
app.use('/api', aiRoutes);               // Routes for AI prediction

// Basic root route for testing if the server is running
app.get('/', (req, res) => {
  res.send('Bunk Maadi API is running...');
});

const PORT = process.env.PORT || 5000; // Use port from .env or default to 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

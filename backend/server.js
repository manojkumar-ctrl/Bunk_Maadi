const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Import route handlers
const subjectRoutes = require('./routes/subjectRoutes');
const bunkRoutes = require('./routes/bunkRoutes');
const aiRoutes = require('./routes/aiRoutes');


dotenv.config(); // Load environment variables from .env file
connectDB(); // Connect to MongoDB database

const app = express();

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(cors()); // Enable CORS

// Route Handlers - All routes will be prefixed with /api
app.use('/api/subjects', subjectRoutes);     // Subject management
app.use('/api', bunkRoutes);                 // Bunking & attendance
app.use('/api', aiRoutes);                   // AI prediction


// Root test route
app.get('/', (req, res) => {
  res.send('Bunk Maadi API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

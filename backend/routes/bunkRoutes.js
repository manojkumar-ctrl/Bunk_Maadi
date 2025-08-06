const express = require('express');
const router = express.Router();
const { recordBunk } = require('../controllers/bunkController');
const { getBunkHistory } = require('../controllers/history.js'); // Import the new controller

// Bunk a class and update records
router.post('/bunk', recordBunk);

// NEW Route to get bunk history
router.get('/bunk-history/:userId', getBunkHistory);

module.exports = router;
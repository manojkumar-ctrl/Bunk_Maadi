// backend/routes/bunkRoutes.js
const express = require('express');
const { recordBunk, recordAttendance, getTopBunkers } = require('../controllers/bunkController');
const router = express.Router();

router.post('/bunk', recordBunk);
router.post('/attend', recordAttendance);
router.get('/leaderboard/top-bunkers', getTopBunkers);

module.exports = router;

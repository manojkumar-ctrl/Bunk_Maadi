// backend/routes/bunkRoutes.js
const express = require('express');
const router = express.Router();

const { recordBunk } = require('../controllers/bunkController');
const { getBunkHistory } = require('../controllers/history');
// const requireAuth = require('../middlewares/authmiddleware'); // remove this line

// router.use(requireAuth); // remove this since auth is global

router.post('/bunk', recordBunk);
router.get('/bunk-history', getBunkHistory);

module.exports = router;

// backend/routes/aiRoutes.js
const express = require('express');
const { getBunkPrediction } = require('../controllers/aiController');
const router = express.Router();

router.post('/predict-bunk', getBunkPrediction);

module.exports = router;

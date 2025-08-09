const express = require('express');
const router = express.Router();
const { getCalendarAuthUrl, oauthCallback, addCalendarEvent } = require('../controllers/calendarController');

// All routes protected by global requireAuth in server.js
router.get('/calendar/auth-url', getCalendarAuthUrl);
router.get('/calendar/oauth2callback', oauthCallback);
router.post('/calendar/add-event', addCalendarEvent);

module.exports = router;



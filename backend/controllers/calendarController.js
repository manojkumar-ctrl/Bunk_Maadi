const { google } = require('googleapis');
const GoogleToken = require('../models/GoogleToken');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI // e.g. https://your-backend.com/api/calendar/oauth2callback
);

function getAuthUrl() {
  const scopes = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar',
    'openid',
    'email',
    'profile',
  ];
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
  });
}

async function ensureOauthForUser(userId) {
  const tokenDoc = await GoogleToken.findOne({ userId });
  if (!tokenDoc) return null;
  oauth2Client.setCredentials({
    access_token: tokenDoc.accessToken,
    refresh_token: tokenDoc.refreshToken,
    scope: tokenDoc.scope,
    token_type: tokenDoc.tokenType,
    expiry_date: tokenDoc.expiryDate,
  });
  return tokenDoc;
}

// GET /api/calendar/auth-url
const getCalendarAuthUrl = async (req, res) => {
  try {
    if (!req.auth?.userId) return res.status(401).json({ message: 'Unauthorized' });
    // include userId in OAuth state so callback can associate without Clerk auth
    const state = encodeURIComponent(JSON.stringify({ userId: req.auth.userId }));
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/calendar',
        'openid',
        'email',
        'profile',
      ],
      state,
    });
    return res.json({ url });
  } catch (err) {
    console.error('getCalendarAuthUrl error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/calendar/oauth2callback?code=...
const oauthCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code) return res.status(400).send('Missing code');

    let userIdFromState = null;
    try {
      if (state) {
        const parsed = JSON.parse(decodeURIComponent(state));
        userIdFromState = parsed.userId;
      }
    } catch (_) {}
    if (!userIdFromState) return res.status(400).send('Missing user context');

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const upsert = await GoogleToken.findOneAndUpdate(
      { userId: userIdFromState },
      {
        userId: userIdFromState,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        scope: tokens.scope,
        tokenType: tokens.token_type,
        expiryDate: tokens.expiry_date,
      },
      { upsert: true, new: true }
    );

    // Notify opener and close
    res.send(`<!DOCTYPE html><html><body><script>
      try { if (window.opener) { window.opener.postMessage('google-calendar-connected', '*'); } } catch (e) {}
      window.close();
    </script><p>You can close this window.</p></body></html>`);
  } catch (err) {
    console.error('oauthCallback error:', err);
    res.status(500).send('OAuth error');
  }
};

// POST /api/calendar/add-event
// body: { date: 'DD/MM/YYYY', subjects: [..] }
const addCalendarEvent = async (req, res) => {
  try {
    if (!req.auth?.userId) return res.status(401).json({ message: 'Unauthorized' });
    const userId = req.auth.userId;

    const tokenDoc = await ensureOauthForUser(userId);
    if (!tokenDoc) {
      return res.status(401).json({ message: 'Not connected to Google', needsAuth: true });
    }

    const { date, subjects } = req.body || {};
    if (!date || !Array.isArray(subjects)) {
      return res.status(400).json({ message: 'date and subjects are required' });
    }

    const [day, month, year] = date.split('/').map(Number);
    // Create an all-day event in Asia/Kolkata so it's pinned to the chosen date
    const startDateStr = `${year.toString().padStart(4, '0')}-${month
      .toString()
      .padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    // end date must be the next day for all-day events
    const endDate = new Date(year, month - 1, day);
    endDate.setDate(endDate.getDate() + 1);
    const endDateStr = `${endDate.getFullYear()}-${(endDate.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')}`;
    const timeZone = 'Asia/Kolkata';

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const isSingle = subjects.length === 1;
    const summary = isSingle ? `Bunked: ${subjects[0]}` : 'Bunked Classes';
    const description = isSingle
      ? `Subject bunked: ${subjects[0]}`
      : `Subjects bunked: ${subjects.join(', ')}`;
    const event = {
      summary,
      description,
      start: { date: startDateStr, timeZone },
      end: { date: endDateStr, timeZone },
    };

    const resp = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    return res.json({ message: 'Event created', eventId: resp.data.id });
  } catch (err) {
    console.error('addCalendarEvent error:', err);
    return res.status(500).json({ message: 'Failed to create calendar event' });
  }
};

module.exports = { getCalendarAuthUrl, oauthCallback, addCalendarEvent };



// backend/controllers/aiController.js
// Use dynamic import for node-fetch as it's an ES Module
let fetch;
import('node-fetch').then(module => {
  fetch = module.default; // node-fetch exports its main function as default
}).catch(error => {
  console.error("Failed to load node-fetch:", error);
  // Handle error, e.g., by making fetch a no-op or throwing
  fetch = () => { throw new Error("node-fetch not loaded"); };
});

require('dotenv').config(); // Ensure dotenv is loaded for API keys

// Function to fetch weather data (mock or real API)
const getBengaluruWeather = async () => {
  // Option 1: Mock weather (for development without a real API key/setup)
  // const mockWeathers = [
  //   "Clear sky, 28°C, low humidity",
  //   "Light rain, 25°C, moderate humidity",
  //   "Overcast clouds, 26°C, high humidity",
  //   "Sunny, 30°C, dry"
  // ];
  // return mockWeathers[Math.floor(Math.random() * mockWeathers.length)];

  // Option 2: Integrate with a real weather API (e.g., OpenWeatherMap)
  const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
  const city = 'Bengaluru';
  const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (response.ok) {
      return `${data.weather[0].description}, ${data.main.temp}°C, humidity ${data.main.humidity}%`;
    } else {
      console.error('Weather API error:', data.message);
      return 'Weather data unavailable.';
    }
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    return 'Weather data unavailable.';
  }
};

// @desc    Get AI bunk prediction
// @route   POST /api/predict-bunk
// @access  Public (or Private if linked to user session)
const getBunkPrediction = async (req, res) => {
  const { subjectName, currentAttendance, minRequiredAttendance, maxBunkable } = req.body;

  console.log("--- AI Prediction Request Received ---");
  console.log("Subject:", subjectName);
  console.log("Current Attendance:", currentAttendance);
  console.log("Min Required Attendance:", minRequiredAttendance);
  // Use maxBunkable from client if provided (derived on frontend)


  if (!subjectName || currentAttendance === undefined || minRequiredAttendance === undefined) {
    console.error("Missing required prediction parameters.");
    return res.status(400).json({ message: 'Missing required prediction parameters' });
  }

  try {
    // Ensure fetch is loaded before using it (weather fetch)
    if (!fetch) {
      console.error("node-fetch is not yet loaded when getBunkPrediction was called.");
      return res.status(500).json({ message: "AI service internal error: node-fetch not ready." });
    }

    const bengaluruWeather = await getBengaluruWeather();
    console.log("Bengaluru Weather fetched:", bengaluruWeather);

    const weatherText = (bengaluruWeather || '').toLowerCase();
    const severeWeather = /(heavy|moderate)\s*rain|thunder|storm|downpour|cyclone|hail|snow|flood|deluge/.test(weatherText);

    const currentPct = Number(currentAttendance);
    const nearSeventy = currentPct >= 65 && currentPct <= 72;
    const bunkableNum = typeof maxBunkable === 'number' ? maxBunkable : -1;

    let decision = 'no';
    if (bunkableNum > 0) {
      decision = 'yes';
    } else if (bunkableNum <= 0 && severeWeather && nearSeventy) {
      decision = 'yes';
    }

    const plural = (n) => (n === 1 ? 'class' : 'classes');
    let lines = [];
    lines.push(`Subject: ${subjectName}`);
    lines.push(`Current attendance: ${currentPct}%`);
    lines.push(`Minimum required: ${minRequiredAttendance}%`);
    lines.push(`Weather today: ${bengaluruWeather}`);
    if (bunkableNum >= 0) {
      lines.push(`Bunkable classes remaining: ${bunkableNum}`);
    }

    if (decision === 'yes' && bunkableNum > 0) {
      lines.push(`Recommendation: Yes — you can bunk up to ${bunkableNum} ${plural(bunkableNum)} safely.`);
    } else if (decision === 'yes') {
      lines.push(`Recommendation: Yes (weather exception) — conditions are poor and your attendance is near 70%. Bunking today is acceptable with caution.`);
    } else {
      // Special guidance for 75–85% with no bunkable buffer
      if (bunkableNum <= 0 && currentPct >= 75 && currentPct <= 85) {
        lines.push(`Recommendation: No — attend class. You're in the 75–85% band and have no bunkable buffer.`);
        lines.push(`Tip: In emergencies, a certificate or a supportive faculty may save attendance, but do not rely on it. Avoid bunking today.`);
      } else {
        lines.push(`Recommendation: No — attend class. You do not have bunkable buffer left.`);
      }
    }

    const predictionText = lines.join('\n');
    res.json({ prediction: predictionText, weather: bengaluruWeather, decision, bunkable: bunkableNum });
  } catch (error) {
    console.error("Error in AI prediction caught by try-catch:", error);
    res.status(500).json({ message: "Server error during AI prediction. Check backend logs." });
  } finally {
    console.log("--- AI Prediction Request Finished ---");
  }
};

module.exports = {
  getBunkPrediction,
};

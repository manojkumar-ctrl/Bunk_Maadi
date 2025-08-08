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
  const { subjectName, currentAttendance, minRequiredAttendance, hasStrikesOrEmergency } = req.body;

  console.log("--- AI Prediction Request Received ---");
  console.log("Subject:", subjectName);
  console.log("Current Attendance:", currentAttendance);
  console.log("Min Required Attendance:", minRequiredAttendance);
  console.log("Strikes/Emergency:", hasStrikesOrEmergency);


  if (!subjectName || currentAttendance === undefined || minRequiredAttendance === undefined || !hasStrikesOrEmergency) {
    console.error("Missing required prediction parameters.");
    return res.status(400).json({ message: 'Missing required prediction parameters' });
  }

  try {
    // Ensure fetch is loaded before using it
    if (!fetch) {
      console.error("node-fetch is not yet loaded when getBunkPrediction was called.");
      return res.status(500).json({ message: "AI service internal error: node-fetch not ready." });
    }

    const bengaluruWeather = await getBengaluruWeather();
    console.log("Bengaluru Weather fetched:", bengaluruWeather);


    const prompt = `
      As an attendance advisor for a student in Bengaluru, provide advice on whether they can bunk their next class.
      Here are the details:
      - Current attendance for ${subjectName}: ${currentAttendance}%
      - Minimum required attendance: ${minRequiredAttendance}%
      - Current Bengaluru weather: ${bengaluruWeather}
      - Are there any city-wide strikes or national emergencies in Bengaluru today? ${hasStrikesOrEmergency}

      Based on this, should the student bunk? Provide a clear recommendation (e.g., 'Yes, you can bunk safely', 'Bunk with caution', 'No, do NOT bunk') and a brief, professional justification. Keep it concise and encouraging.
    `;
    console.log("Prompt sent to LLM:\n", prompt);


    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    console.log("GEMINI_API_KEY (first 5 chars):", GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 5) + '...' : 'NOT SET'); // Log partial key for security
    if (!GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY is not set in environment variables.");
        return res.status(500).json({ message: "AI service not configured." });
    }

    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
    console.log("Gemini API URL:", apiUrl);

    const llmResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // console.log("LLM Response Status:", llmResponse.status);
    // console.log("LLM Response Status Text:", llmResponse.statusText);

    const llmResult = await llmResponse.json();
    console.log("Full LLM Result:", JSON.stringify(llmResult, null, 2));


    if (llmResult.candidates && llmResult.candidates.length > 0 &&
        llmResult.candidates[0].content && llmResult.candidates[0].content.parts &&
        llmResult.candidates[0].content.parts.length > 0) {
      const predictionText = llmResult.candidates[0].content.parts[0].text;
      // console.log("AI Prediction successful.");
      res.json({ prediction: predictionText, weather: bengaluruWeather });
    } else {
      // console.error("Unexpected LLM response structure or missing content.");
      res.status(500).json({ message: "Failed to get prediction from AI. Unexpected response." });
    }
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

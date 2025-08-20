const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// --- External API Functions ---

// @desc    Fetch weather data
// @route   POST /api/external/weather
const getWeather = async (req, res) => {
  const { location } = req.body;
  if (!location) return res.status(400).json({ message: 'Location is required' });

  const API_KEY = process.env.OPENWEATHERMAP_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`;

  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: 'Failed to fetch weather data', error: error.message });
  }
};

// @desc    Fetch news headlines
// @route   POST /api/external/news
const getNews = async (req, res) => {
  const { query } = req.body; // e.g., 'technology'
  if (!query) return res.status(400).json({ message: 'Query is required' });

  const API_KEY = process.env.NEWS_API_KEY;
  const url = `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&apiKey=${API_KEY}&pageSize=10`;

  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: 'Failed to fetch news data', error: error.message });
  }
};

// @desc    Fetch stock data
// @route   POST /api/external/stocks
const getStocks = async (req, res) => {
    const { symbols } = req.body; // Expects an array of symbols e.g., ['AAPL', 'GOOGL']
    if (!symbols || !Array.isArray(symbols)) return res.status(400).json({ message: 'Stock symbols array is required' });

    const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

    try {
        const stockData = await Promise.all(
            symbols.map(async (symbol) => {
                const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
                const response = await axios.get(url);
                return { symbol, data: response.data['Global Quote'] };
            })
        );
        res.json(stockData);
    } catch (error) {
        res.status(error.response?.status || 500).json({ message: 'Failed to fetch stock data', error: error.message });
    }
};

// @desc    Fetch tweets from X accounts
// @route   POST /api/external/tweets
const getTweets = async (req, res) => {
  const { account } = req.body; // e.g., 'Google'
  if (!account) return res.status(400).json({ message: 'Account name is required' });

  const TOKEN = process.env.TWITTER_BEARER_TOKEN;
  // This is a simplified example. The X API v2 is more complex.
  // This finds a user by username and then fetches their tweets.
  const userUrl = `https://api.twitter.com/2/users/by/username/${account}`;
  try {
    const userResponse = await axios.get(userUrl, { headers: { 'Authorization': `Bearer ${TOKEN}` } });
    const userId = userResponse.data.data.id;
    const tweetsUrl = `https://api.twitter.com/2/users/${userId}/tweets?max_results=10`;
    const tweetsResponse = await axios.get(tweetsUrl, { headers: { 'Authorization': `Bearer ${TOKEN}` } });
    res.json(tweetsResponse.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: 'Failed to fetch tweets', error: error.message });
  }
};

// --- AI Helper Function ---

// @desc    Get AI summary for given text content
// @route   POST /api/external/ai/summarize
const getAiSummary = async (req, res) => {
  const { content, prompt } = req.body;

  if (!content || !prompt) {
    return res.status(400).json({ message: 'Content and prompt are required.' });
  }

  try {
    const fullPrompt = `${prompt}\n\nHere is the content:\n${content}`;
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    res.json({ summary: text });
  } catch (error) {
    console.error('Error with Gemini AI for summarization:', error);
    res.status(500).json({ message: 'Failed to get AI summary.' });
  }
};


module.exports = {
  getWeather,
  getNews,
  getStocks,
  getTweets,
  getAiSummary,
};

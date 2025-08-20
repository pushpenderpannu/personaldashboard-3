const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getWeather,
  getNews,
  getStocks,
  getTweets,
  getAiSummary,
} = require('../controllers/externalApiController');

// All routes here are protected
router.use(protect);

// Routes for fetching data from external APIs
router.post('/weather', getWeather);
router.post('/news', getNews);
router.post('/stocks', getStocks);
router.post('/tweets', getTweets);

// Route for getting AI summary for any text content
router.post('/ai/summarize', getAiSummary);

module.exports = router;

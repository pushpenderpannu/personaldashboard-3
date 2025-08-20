import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Box, Typography, CircularProgress, Alert, Button, Modal } from '@mui/material';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import GrainIcon from '@mui/icons-material/Grain';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: 500, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4,
};

// Simple mapping of weather conditions to MUI icons
const getWeatherIcon = (main) => {
  switch (main) {
    case 'Clear': return <WbSunnyIcon sx={{ fontSize: 60 }} />;
    case 'Clouds': return <CloudIcon sx={{ fontSize: 60 }} />;
    case 'Rain':
    case 'Drizzle':
    case 'Thunderstorm':
      return <GrainIcon sx={{ fontSize: 60 }} />;
    case 'Snow': return <AcUnitIcon sx={{ fontSize: 60 }} />;
    default: return <CloudIcon sx={{ fontSize: 60 }} />;
  }
};

const WeatherWidget = ({ config, aiPrompt }) => {
  const { user } = useAuth();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);

  const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${user.token}` } });

  useEffect(() => {
    const fetchWeather = async () => {
      if (!config.location) {
        setError('Location not set. Please configure in widget settings.');
        setLoading(false);
        return;
      }
      setError('');
      setLoading(true);
      try {
        const { data } = await axios.post('/api/external/weather', { location: config.location }, getAuthHeader());
        setWeather(data);
      } catch (err) {
        setError('Failed to fetch weather data. Invalid location?');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchWeather();
    }
  }, [user, config.location]);

  const handleGetSuggestion = async () => {
    if (!weather) return;
    try {
      const weatherText = `Current weather in ${config.location}: ${weather.main.temp}°C, ${weather.weather[0].description}.`;
      const { data } = await axios.post('/api/external/ai/summarize', {
        content: weatherText,
        prompt: aiPrompt,
      }, getAuthHeader());
      setSuggestion(data.summary);
      setIsSuggestionModalOpen(true);
    } catch (err) {
      setError('Failed to get AI suggestion.');
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      {error && <Alert severity="warning">{error}</Alert>}
      {weather ? (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5">{weather.name}</Typography>
          <Box sx={{ my: 2 }}>{getWeatherIcon(weather.weather[0].main)}</Box>
          <Typography variant="h3">{Math.round(weather.main.temp)}°C</Typography>
          <Typography variant="subtitle1">{weather.weather[0].description}</Typography>
          <Button onClick={handleGetSuggestion} startIcon={<AutoFixHighIcon />} size="small" sx={{ mt: 2 }}>
            Get AI Insight
          </Button>
        </Box>
      ) : (
        !error && <Typography>No weather data.</Typography>
      )}

      <Modal open={isSuggestionModalOpen} onClose={() => setIsSuggestionModalOpen(false)}>
        <Box sx={modalStyle}>
            <Typography variant="h6">AI Insight</Typography>
            <Typography sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>{suggestion}</Typography>
        </Box>
      </Modal>
    </Box>
  );
};

export default WeatherWidget;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  Box, Typography, CircularProgress, Alert, Button, Modal, Grid, Paper
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: 600, maxHeight: '80vh', overflowY: 'auto',
  bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4,
};

const StocksWidget = ({ config, aiPrompt }) => {
  const { user } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState('');
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${user.token}` } });

  useEffect(() => {
    const fetchStocks = async () => {
      const symbols = config.symbols?.split(',').map(s => s.trim()).filter(Boolean);
      if (!symbols || symbols.length === 0) {
        setError('Stock symbols not set.');
        setLoading(false);
        return;
      }
      setError('');
      setLoading(true);
      try {
        const { data } = await axios.post('/api/external/stocks', { symbols }, getAuthHeader());
        // Filter out unsuccessful API calls which might return empty data
        setStocks(data.filter(stock => stock.data && stock.data['01. symbol']));
      } catch (err) {
        setError('Failed to fetch stock data.');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchStocks();
  }, [user, config.symbols]);

  const handleGetSummary = async () => {
    if (stocks.length === 0) return;
    try {
        setSummary('Generating analysis...');
        setIsSummaryModalOpen(true);
        const stocksText = stocks.map(s => `Symbol: ${s.data['01. symbol']}, Price: ${s.data['05. price']}, Change: ${s.data['10. change percent']}`).join('\n');
        const { data } = await axios.post('/api/external/ai/summarize', { content: stocksText, prompt: aiPrompt }, getAuthHeader());
        setSummary(data.summary);
    } catch(err) {
        setError('Failed to get AI analysis.');
        setSummary('Could not generate analysis.');
    }
  };

  const chartData = {
    labels: stocks.map(s => s.data['01. symbol']),
    datasets: [{
      label: 'Current Price (USD)',
      data: stocks.map(s => parseFloat(s.data['05. price'])),
      backgroundColor: 'rgba(144, 202, 249, 0.6)',
      borderColor: 'rgba(144, 202, 249, 1)',
      borderWidth: 1,
    }],
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      {error && <Alert severity="warning">{error}</Alert>}
      {stocks.length > 0 ? (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
             {stocks.map(stock => {
                const quote = stock.data;
                const price = parseFloat(quote['05. price']);
                const changePercent = parseFloat(quote['10. change percent']);
                const isPositive = changePercent >= 0;
                return (
                    <Box key={quote['01. symbol']} sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1}}>
                        <Typography variant="h6">{quote['01. symbol']}</Typography>
                        <Typography variant="h6">${price.toFixed(2)}</Typography>
                        <Typography color={isPositive ? 'success.main' : 'error.main'} sx={{display: 'flex', alignItems: 'center'}}>
                            {isPositive ? <ArrowUpwardIcon fontSize="small"/> : <ArrowDownwardIcon fontSize="small"/>}
                            {changePercent.toFixed(2)}%
                        </Typography>
                    </Box>
                )
             })}
          </Grid>
          <Grid item xs={12} md={6}>
            <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </Grid>
          <Grid item xs={12}>
            <Button onClick={handleGetSummary} startIcon={<AutoFixHighIcon />} size="small" sx={{ mt: 1 }}>
                Analyze with AI
            </Button>
          </Grid>
        </Grid>
      ) : (
        !error && <Typography>No stock data found.</Typography>
      )}
      <Modal open={isSummaryModalOpen} onClose={() => setIsSummaryModalOpen(false)}>
        <Box sx={modalStyle}>
            <Typography variant="h6">AI Analysis</Typography>
            <Typography sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>{summary}</Typography>
        </Box>
      </Modal>
    </Box>
  );
};

export default StocksWidget;

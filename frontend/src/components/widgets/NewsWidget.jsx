import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  Box, Typography, CircularProgress, Alert, Button, Modal, Link, List, ListItem, ListItemText, Divider
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: 600, maxHeight: '80vh', overflowY: 'auto',
  bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4,
};

const NewsWidget = ({ config, aiPrompt }) => {
  const { user } = useAuth();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState('');
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${user.token}` } });

  useEffect(() => {
    const fetchNews = async () => {
      if (!config.query) {
        setError('News query not set. Please configure in widget settings.');
        setLoading(false);
        return;
      }
      setError('');
      setLoading(true);
      try {
        const { data } = await axios.post('/api/external/news', { query: config.query }, getAuthHeader());
        setNews(data);
      } catch (err) {
        setError('Failed to fetch news data.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchNews();
    }
  }, [user, config.query]);

  const handleGetSummary = async () => {
    if (!news || !news.articles || news.articles.length === 0) return;
    try {
      setSummary('Generating summary...');
      setIsSummaryModalOpen(true);
      const articlesText = news.articles.map(a => `Title: ${a.title}\nDescription: ${a.description}`).join('\n\n');
      const { data } = await axios.post('/api/external/ai/summarize', {
        content: articlesText,
        prompt: aiPrompt,
      }, getAuthHeader());
      setSummary(data.summary);
    } catch (err) {
      setError('Failed to get AI summary.');
      setSummary('Could not generate summary.');
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {error && <Alert severity="warning">{error}</Alert>}
      {news && news.articles ? (
        <>
          <List sx={{ overflowY: 'auto', flexGrow: 1 }}>
            {news.articles.map((article, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={<Link href={article.url} target="_blank" rel="noopener noreferrer">{article.title}</Link>}
                    secondary={article.description}
                  />
                </ListItem>
                {index < news.articles.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
          <Button onClick={handleGetSummary} startIcon={<AutoFixHighIcon />} size="small" sx={{ mt: 1 }}>
            Summarize with AI
          </Button>
        </>
      ) : (
        !error && <Typography>No news articles found.</Typography>
      )}

      <Modal open={isSummaryModalOpen} onClose={() => setIsSummaryModalOpen(false)}>
        <Box sx={modalStyle}>
            <Typography variant="h6">AI Summary</Typography>
            <Typography sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>{summary}</Typography>
        </Box>
      </Modal>
    </Box>
  );
};

export default NewsWidget;

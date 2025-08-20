import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  Box, Typography, CircularProgress, Alert, Button, Modal, List, ListItem, ListItemText, Divider
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: 600, maxHeight: '80vh', overflowY: 'auto',
  bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4,
};

const TweetsWidget = ({ config, aiPrompt }) => {
  const { user } = useAuth();
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState('');
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${user.token}` } });

  useEffect(() => {
    const fetchTweets = async () => {
      if (!config.account) {
        setError('Twitter account not set.');
        setLoading(false);
        return;
      }
      setError('');
      setLoading(true);
      try {
        const { data } = await axios.post('/api/external/tweets', { account: config.account }, getAuthHeader());
        setTweets(data.data || []);
      } catch (err) {
        setError('Failed to fetch tweets. Check account name and backend API.');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchTweets();
  }, [user, config.account]);

  const handleGetSummary = async () => {
    if (tweets.length === 0) return;
    try {
      setSummary('Generating summary...');
      setIsSummaryModalOpen(true);
      const tweetsText = tweets.map(t => t.text).join('\n\n---\n\n');
      const { data } = await axios.post('/api/external/ai/summarize', { content: tweetsText, prompt: aiPrompt }, getAuthHeader());
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
      {tweets.length > 0 ? (
        <>
          <List sx={{ overflowY: 'auto', flexGrow: 1 }}>
            {tweets.map((tweet) => (
              <React.Fragment key={tweet.id}>
                <ListItem>
                  <ListItemText primary={tweet.text} />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
          <Button onClick={handleGetSummary} startIcon={<AutoFixHighIcon />} size="small" sx={{ mt: 1 }}>
            Summarize with AI
          </Button>
        </>
      ) : (
        !error && <Typography>No tweets found for this account.</Typography>
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

export default TweetsWidget;

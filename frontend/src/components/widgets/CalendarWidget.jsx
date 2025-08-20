import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Box, CircularProgress, Alert, Button, Modal, Typography } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: 500, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4,
};

const CalendarWidget = ({ aiPrompt }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);

  const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${user.token}` } });

  useEffect(() => {
    const fetchTasksAsEvents = async () => {
      setLoading(true);
      try {
        const { data: tasks } = await axios.get('/api/tasks', getAuthHeader());
        const formattedEvents = tasks.map(task => ({
          title: task.content,
          date: task.dueDate || task.createdAt, // Use due date if available, otherwise creation date
          allDay: true,
          color: task.isCompleted ? 'grey' : '#90caf9',
        }));
        setEvents(formattedEvents);
      } catch (err) {
        setError('Failed to fetch tasks for calendar.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTasksAsEvents();
    }
  }, [user]);

  const handleGetSuggestion = async () => {
    try {
      const tasksForPrompt = events.map(e => ({ content: e.title, isCompleted: e.color === 'grey' }));
      const { data } = await axios.post('/api/tasks/ai/suggest', { tasks: tasksForPrompt, prompt: aiPrompt }, getAuthHeader());
      setSuggestion(data.suggestion);
      setIsSuggestionModalOpen(true);
    } catch (err) {
      setError('Failed to get AI suggestion.');
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ position: 'relative', height: '100%' }}>
      {error && <Alert severity="error">{error}</Alert>}
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        height="100%"
        headerToolbar={{
          left: 'prev,next',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek'
        }}
      />
       <Button
        onClick={handleGetSuggestion}
        startIcon={<AutoFixHighIcon />}
        size="small"
        sx={{ position: 'absolute', bottom: 8, right: 8 }}
      >
        AI Suggestion
      </Button>
      <Modal open={isSuggestionModalOpen} onClose={() => setIsSuggestionModalOpen(false)}>
        <Box sx={modalStyle}>
            <Typography variant="h6">AI Suggestion</Typography>
            <Typography sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>{suggestion}</Typography>
        </Box>
      </Modal>
    </Box>
  );
};

export default CalendarWidget;

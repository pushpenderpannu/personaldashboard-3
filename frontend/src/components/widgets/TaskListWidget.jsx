import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  Box, List, ListItem, ListItemText, Checkbox, IconButton, TextField, Button, Typography, CircularProgress, Alert, Modal
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: 500, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4,
};

const TaskListWidget = ({ aiPrompt }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);

  const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${user.token}` } });

  const fetchTasks = async () => {
    try {
      const { data } = await axios.get('/api/tasks', getAuthHeader());
      setTasks(data);
    } catch (err) {
      setError('Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskContent.trim()) return;
    try {
      const { data } = await axios.post('/api/tasks', { content: newTaskContent }, getAuthHeader());
      setTasks([data, ...tasks]);
      setNewTaskContent('');
    } catch (err) {
      setError('Failed to add task.');
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const { data } = await axios.put(`/api/tasks/${task._id}`, { isCompleted: !task.isCompleted }, getAuthHeader());
      setTasks(tasks.map(t => t._id === task._id ? data : t));
    } catch (err) {
      setError('Failed to update task.');
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`/api/tasks/${id}`, getAuthHeader());
      setTasks(tasks.filter(t => t._id !== id));
    } catch (err) {
      setError('Failed to delete task.');
    }
  };

  const handleGetSuggestion = async () => {
    try {
      const { data } = await axios.post('/api/tasks/ai/suggest', { tasks, prompt: aiPrompt }, getAuthHeader());
      setSuggestion(data.suggestion);
      setIsSuggestionModalOpen(true);
    } catch (err) {
      setError('Failed to get AI suggestion.');
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {error && <Alert severity="error">{error}</Alert>}
      <Box component="form" onSubmit={handleAddTask} sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <TextField
          size="small"
          fullWidth
          variant="outlined"
          label="New Task"
          value={newTaskContent}
          onChange={(e) => setNewTaskContent(e.target.value)}
        />
        <Button type="submit" variant="contained" endIcon={<AddIcon />}>Add</Button>
      </Box>
      <List sx={{ overflowY: 'auto', flexGrow: 1 }}>
        {tasks.map(task => (
          <ListItem
            key={task._id}
            secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteTask(task._id)}>
                <DeleteIcon />
              </IconButton>
            }
            disablePadding
          >
            <Checkbox
              edge="start"
              checked={task.isCompleted}
              tabIndex={-1}
              disableRipple
              onChange={() => handleToggleComplete(task)}
            />
            <ListItemText primary={task.content} sx={{ textDecoration: task.isCompleted ? 'line-through' : 'none' }} />
          </ListItem>
        ))}
      </List>
      <Button onClick={handleGetSuggestion} startIcon={<AutoFixHighIcon />} size="small">
        Get AI Suggestion
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

export default TaskListWidget;

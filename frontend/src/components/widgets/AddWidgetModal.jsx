import React, { useState } from 'react';
import {
  Modal, Box, Typography, Button, Select, MenuItem, FormControl, InputLabel, TextField
} from '@mui/material';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const WIDGET_TYPES = {
  TaskList: {
    name: 'Task List',
    defaultConfig: {},
    defaultPrompt: 'Prioritize my tasks for a productive day.',
  },
  Weather: {
    name: 'Weather',
    defaultConfig: { location: '' },
    defaultPrompt: 'Suggest an outfit based on the weather.',
  },
  News: {
    name: 'News',
    defaultConfig: { query: 'technology' },
    defaultPrompt: 'Summarize the top 3 news stories.',
  },
  Stocks: {
    name: 'Stocks',
    defaultConfig: { symbols: 'AAPL,GOOGL' },
    defaultPrompt: 'Analyze these stock trends and suggest actions.',
  },
  Tweets: {
    name: 'Tweets',
    defaultConfig: { account: 'Google' },
    defaultPrompt: 'Summarize key insights from these tweets.',
  },
  Calendar: {
      name: 'Calendar',
      defaultConfig: {},
      defaultPrompt: 'Generate a daily schedule based on my tasks.',
  }
};

const AddWidgetModal = ({ open, onClose, onAddWidget }) => {
  const [widgetType, setWidgetType] = useState('');
  const [config, setConfig] = useState({});
  const [aiPrompt, setAiPrompt] = useState('');

  const handleTypeChange = (e) => {
    const type = e.target.value;
    setWidgetType(type);
    setConfig(WIDGET_TYPES[type].defaultConfig);
    setAiPrompt(WIDGET_TYPES[type].defaultPrompt);
  };

  const handleConfigChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    if (!widgetType) return;
    onAddWidget({
        widgetType,
        config,
        aiPrompt
    });
    // Reset state and close
    setWidgetType('');
    setConfig({});
    setAiPrompt('');
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" component="h2">Add New Widget</Typography>

        <FormControl fullWidth margin="normal">
          <InputLabel>Widget Type</InputLabel>
          <Select value={widgetType} label="Widget Type" onChange={handleTypeChange}>
            {Object.entries(WIDGET_TYPES).map(([key, value]) => (
              <MenuItem key={key} value={key}>{value.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {widgetType && (
          <>
            {Object.keys(config).map(key => (
              <TextField
                key={key}
                name={key}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                value={config[key]}
                onChange={handleConfigChange}
                fullWidth
                margin="normal"
                helperText={key === 'symbols' ? 'Comma-separated, e.g., AAPL,GOOGL' : ''}
              />
            ))}
            <TextField
              name="aiPrompt"
              label="AI Prompt"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              fullWidth
              multiline
              rows={3}
              margin="normal"
            />
          </>
        )}

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained" sx={{ ml: 1 }} disabled={!widgetType}>
            Add Widget
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddWidgetModal;

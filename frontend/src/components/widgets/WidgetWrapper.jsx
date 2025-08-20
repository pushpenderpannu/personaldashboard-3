import React, { useState } from 'react';
import { Paper, Typography, IconButton, Box, Modal, TextField, Button } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const WidgetWrapper = ({ title, children, settings, onSettingsChange, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [currentSettings, setCurrentSettings] = useState(settings || {});

  const handleOpen = () => {
    setCurrentSettings(settings || {});
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleSave = () => {
    onSettingsChange(currentSettings);
    handleClose();
  };

  const handleFieldChange = (e) => {
    setCurrentSettings({ ...currentSettings, [e.target.name]: e.target.value });
  }

  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6">{title}</Typography>
        <div>
          {onSettingsChange && (
            <IconButton onClick={handleOpen} size="small">
              <SettingsIcon />
            </IconButton>
          )}
          {onDelete && (
             <IconButton onClick={onDelete} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </div>
      </Box>
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {children}
      </Box>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="widget-settings-modal"
      >
        <Box sx={modalStyle}>
          <Typography id="widget-settings-modal" variant="h6" component="h2">
            {title} Settings
          </Typography>

          {/* Render settings fields dynamically */}
          {Object.keys(settings || {}).map((key) => (
             key !== 'aiPrompt' && // handle aiPrompt separately
             <TextField
                key={key}
                name={key}
                label={key.charAt(0).toUpperCase() + key.slice(1)} // Capitalize
                value={currentSettings[key] || ''}
                onChange={handleFieldChange}
                fullWidth
                margin="normal"
             />
          ))}

          {/* Always include AI Prompt field */}
           <TextField
                name="aiPrompt"
                label="AI Prompt"
                value={currentSettings.aiPrompt || ''}
                onChange={handleFieldChange}
                fullWidth
                multiline
                rows={4}
                margin="normal"
                helperText="Customize the prompt for AI-powered insights."
            />

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSave} variant="contained" sx={{ ml: 1 }}>Save</Button>
          </Box>
        </Box>
      </Modal>
    </Paper>
  );
};

export default WidgetWrapper;

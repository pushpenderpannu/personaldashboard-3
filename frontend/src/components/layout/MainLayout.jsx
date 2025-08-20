import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import { useNotifications } from '../../context/NotificationContext';

const MainLayout = ({ children }) => {
  const { notifications, dismissNotification } = useNotifications();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            My Dashboard
          </Typography>
          <IconButton color="inherit" onClick={handleNotificationClick}>
            <Badge badgeContent={notifications.length} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleNotificationClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <Box sx={{ width: 360 }}>
              <List>
                {notifications.length === 0 ? (
                  <ListItem>
                    <ListItemText primary="No new notifications" />
                  </ListItem>
                ) : (
                  notifications.map((n) => (
                    <ListItem
                      key={n.id}
                      secondaryAction={
                        <IconButton edge="end" aria-label="dismiss" onClick={() => dismissNotification(n.id)}>
                          <CloseIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText primary={n.title} secondary={n.message} />
                    </ListItem>
                  ))
                )}
              </List>
            </Box>
          </Popover>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;

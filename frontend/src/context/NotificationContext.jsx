import React, { createContext, useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

// Create Context
export const NotificationContext = createContext();

// Custom hook
export const useNotifications = () => {
  return useContext(NotificationContext);
};

// Provider Component
export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Only connect if the user is authenticated
    if (isAuthenticated) {
      const newSocket = io(); // Connect to the server this frontend is served from
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Socket.IO connected');
      });

      newSocket.on('notification', (newNotification) => {
        console.log('Notification received:', newNotification);
        setNotifications((prev) => [...prev, { ...newNotification, id: Date.now() }]);
      });

      return () => {
        newSocket.off('notification');
        newSocket.disconnect();
      };
    } else if (socket) {
        socket.disconnect();
        setSocket(null);
    }
  }, [isAuthenticated]);

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter(n => n.id !== id));
  };

  const value = {
    notifications,
    dismissNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

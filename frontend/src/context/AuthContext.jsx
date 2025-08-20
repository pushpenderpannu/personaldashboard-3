import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import jwt_decode from 'jwt-decode';

// Create Context
export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userFromStorage = JSON.parse(localStorage.getItem('user'));
    if (userFromStorage) {
      // Optional: Check if token is expired
      const decodedToken = jwt_decode(userFromStorage.token);
      if (decodedToken.exp * 1000 < Date.now()) {
        authService.logout();
        setUser(null);
      } else {
        setUser(userFromStorage);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const userData = await authService.login({ email, password });
    setUser(userData);
    return userData;
  };

  const register = async (email, password) => {
    const userData = await authService.register({ email, password });
    setUser(userData);
    return userData;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

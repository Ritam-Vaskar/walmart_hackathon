import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('walmart_token');
    if (token) {
      fetchUserProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userData = await authAPI.getProfile();
      setUser({
        id: userData._id,
        name: userData.name,
        email: userData.email,
        address: userData.address,
      });
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      localStorage.removeItem('walmart_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(email, password);
      localStorage.setItem('walmart_token', response.token);
      setUser({
        id: response._id,
        name: response.name,
        email: response.email,
        address: response.address || {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        }
      });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setIsLoading(true);
    try {
      const response = await authAPI.register(name, email, password);
      localStorage.setItem('walmart_token', response.token);
      setUser({
        id: response._id,
        name: response.name,
        email: response.email,
        address: response.address || {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        }
      });
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('walmart_token');
    setUser(null);
  };

  const updateProfile = async (userData) => {
    setIsLoading(true);
    try {
      const response = await authAPI.updateProfile(userData);
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          name: response.name || prev.name,
          email: response.email || prev.email,
          address: response.address || prev.address
        };
      });
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('walmart_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// AI Assistant API
export const aiAPI = {
  // Send text message to AI assistant
  sendMessage: async (message, userId = null) => {
    const response = await api.post('/ai/chat', { message, userId });
    return response.data;
  },
  
  // Send voice data to AI assistant
  sendVoice: async (audioData, userId = null) => {
    const formData = new FormData();
    formData.append('audio', audioData);
    if (userId) formData.append('userId', userId);
    
    const response = await api.post('/ai/voice', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  // Search products with natural language query
  searchProducts: async (query) => {
    const response = await api.get('/ai/products/search', { params: { query } });
    return response.data;
  },
  
  // Add product to cart via AI assistant
  addToCart: async (productId, quantity = 1) => {
    const response = await api.post('/ai/cart/add', { productId, quantity });
    return response.data;
  },
};

export default aiAPI;
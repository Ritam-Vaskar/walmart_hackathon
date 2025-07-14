// services/arService.js
import axios from 'axios';

// Create axios instance for AR API calls
const arAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token if available
arAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
arAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('AR API Error:', error);
    
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export const checkDeviceARCapabilities = async () => {
  try {
    // Check if the device supports WebXR
    if (!navigator.xr) {
      return {
        isSupported: false,
        reason: 'WebXR not supported'
      };
    }

    // Check for AR session support
    const isSupported = await navigator.xr.isSessionSupported('immersive-ar');
    
    if (!isSupported) {
      // Fallback: Check for basic AR features
      const hasDeviceMotion = 'DeviceMotionEvent' in window;
      const hasDeviceOrientation = 'DeviceOrientationEvent' in window;
      const hasCamera = navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
      
      return {
        isSupported: hasDeviceMotion && hasDeviceOrientation && hasCamera,
        reason: 'Fallback AR support detected'
      };
    }

    return {
      isSupported: true,
      reason: 'Full WebXR AR support'
    };
  } catch (error) {
    console.error('Error checking AR capabilities:', error);
    
    // For demo purposes, we'll enable AR on mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    return {
      isSupported: isMobile,
      reason: 'Demo mode - enabled on mobile devices'
    };
  }
};

export const fetchProductARModel = async (productId, productType) => {
  try {
    const response = await arAPI.get(`/ar-models/${productType}/${productId}`);
    
    if (response.data.success) {
      return response.data.modelUrl;
    } else {
      throw new Error(response.data.error || 'Failed to fetch AR model');
    }
  } catch (error) {
    console.error('Error fetching AR model:', error);
    
    // Enhanced error handling
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 404:
          throw new Error('AR model not found for this product');
        case 400:
          throw new Error(data.message || 'Invalid product type or ID');
        case 500:
          throw new Error('Server error while fetching AR model');
        default:
          throw new Error(data.message || 'Failed to fetch AR model');
      }
    } else if (error.request) {
      // Request made but no response received
      throw new Error('Network error - please check your connection');
    } else {
      // Something else happened
      throw new Error('An unexpected error occurred');
    }
  }
};

export const initializeARSession = async (modelUrl) => {
  try {
    if (!navigator.xr) {
      throw new Error('WebXR not supported');
    }

    const session = await navigator.xr.requestSession('immersive-ar', {
      requiredFeatures: ['hit-test']
    });

    return session;
  } catch (error) {
    console.error('Error initializing AR session:', error);
    throw error;
  }
};

// New function to validate AR model availability
export const validateARModelAvailability = async (productId, productType) => {
  try {
    const response = await arAPI.get(`/ar-models/validate/${productType}/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error validating AR model:', error);
    throw error;
  }
};

// Function to get AR model metadata
export const getARModelMetadata = async (productId, productType) => {
  try {
    const response = await arAPI.get(`/ar-models/metadata/${productType}/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching AR model metadata:', error);
    throw error;
  }
};

// Function to report AR usage analytics
export const reportARUsage = async (productId, productType, sessionData) => {
  try {
    const response = await arAPI.post('/ar-analytics', {
      productId,
      productType,
      sessionData,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
    return response.data;
  } catch (error) {
    console.error('Error reporting AR usage:', error);
    // Don't throw error for analytics - it's not critical
  }
};

// Function to get AR session settings
export const getARSessionSettings = async (productType) => {
  try {
    const response = await arAPI.get(`/ar-settings/${productType}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching AR settings:', error);
    
    // Return default settings if API fails
    return {
      lighting: 'auto',
      scale: 1.0,
      rotation: true,
      hitTest: true,
      shadows: true
    };
  }
};

// Function to preload AR model
export const preloadARModel = async (productId, productType) => {
  try {
    const response = await arAPI.post('/ar-models/preload', {
      productId,
      productType
    });
    return response.data;
  } catch (error) {
    console.error('Error preloading AR model:', error);
    throw error;
  }
};

// Function to get device AR capabilities from server
export const getServerARCapabilities = async () => {
  try {
    const response = await arAPI.get('/ar-capabilities', {
      headers: {
        'User-Agent': navigator.userAgent,
        'Device-Info': JSON.stringify({
          platform: navigator.platform,
          vendor: navigator.vendor,
          language: navigator.language,
          cookieEnabled: navigator.cookieEnabled,
          onLine: navigator.onLine
        })
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching server AR capabilities:', error);
    
    // Return fallback capabilities
    return {
      isSupported: false,
      features: [],
      recommendations: []
    };
  }
};

export default {
  checkDeviceARCapabilities,
  fetchProductARModel,
  initializeARSession,
  validateARModelAvailability,
  getARModelMetadata,
  reportARUsage,
  getARSessionSettings,
  preloadARModel,
  getServerARCapabilities
};
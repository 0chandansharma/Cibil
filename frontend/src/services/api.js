import axios from 'axios';

// Create a function to handle logout that will be set later
let logoutHandler = () => {
  console.warn('Logout handler not initialized');
};

// Export a function to set the logout handler
export const setLogoutHandler = (handler) => {
  logoutHandler = handler;
};

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Get store state without importing store directly
    const state = window.store?.getState();
    const token = state?.auth?.user?.token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Call the logout handler instead of importing directly
      logoutHandler();
    }
    return Promise.reject(error);
  }
);

export default api;
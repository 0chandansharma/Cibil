import axios from 'axios';
// import { store } from '../store';
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
// Fix in frontend/src/services/api.js
let store;

export const injectStore = (_store) => {
  store = _store;
};
api.interceptors.request.use(
  (config) => {
    // Get token directly from store
    const state = store.getState();
    const token = state.auth?.user?.token;
    
    // Log for debugging
    console.log('Token in interceptor:', token);
    
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
    // Only redirect to login on auth error if user was previously authenticated
    if (error.response?.status === 401 && store.getState().auth.isAuthenticated) {
      store.dispatch({ type: 'auth/logout/fulfilled' });
      // Redirect to login if needed
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
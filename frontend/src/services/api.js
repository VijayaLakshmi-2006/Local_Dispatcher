import axios from 'axios';
import { store } from '../store/index.js';
import { logout } from '../store/authSlice.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT token from Redux state
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token || localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch expired token (401) and logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Avoid infinite loop if we are checking profile on init
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        store.dispatch(logout());
      }
    }
    return Promise.reject(error);
  }
);

export default api;

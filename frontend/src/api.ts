import axios from 'axios';

const getBaseURL = () => {
  const url = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  // Ensure the URL ends with /api for consistency
  if (!url.endsWith('/api') && !url.endsWith('/api/')) {
    return url.endsWith('/') ? `${url}api` : `${url}/api`;
  }
  return url;
};

const api = axios.create({
  baseURL: getBaseURL(),
});

// Request interceptor to inject JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

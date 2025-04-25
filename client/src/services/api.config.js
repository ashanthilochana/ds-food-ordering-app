import axios from 'axios';

// Base URLs for different services
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

export const API_URLS = {
  AUTH: `${API_BASE_URL}/auth`,
  RESTAURANT: `${API_BASE_URL}/restaurants`,
  ORDER: `${API_BASE_URL}/orders`,
  PAYMENT: `${API_BASE_URL}/payments`,
  DELIVERY: `${API_BASE_URL}/delivery`,
  NOTIFICATION: `${API_BASE_URL}/notifications`,
};

// Create axios instance with default config
const apiClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor for authentication
apiClient.interceptors.request.use(
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

// Add a response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URLS.AUTH}/refresh-token`, {
            refreshToken,
          });
          localStorage.setItem('token', response.data.token);
          error.config.headers.Authorization = `Bearer ${response.data.token}`;
          return apiClient(error.config);
        }
      } catch (refreshError) {
        // If refresh token fails, logout user
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient; 
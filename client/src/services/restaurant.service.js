// src/services/restaurant.service.js

import axios from 'axios';

const API_URL = window.env?.REACT_APP_RESTAURANT_SERVICE_URL || 'http://localhost:3001/api';

const getAuthToken = () => {
  const authData = localStorage.getItem('user');
  if (authData) {
    try {
      const parsedData = JSON.parse(authData);
      return parsedData.token;
    } catch (error) {
      console.error('Error parsing auth data:', error);
      return null;
    }
  }
  return null;
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    return Promise.reject(error);
  }
);

const restaurantService = {
  getRestaurants: async (filters = {}) => {
    const response = await api.get('/restaurants', { params: filters });
    return response.data;
  },

  getRestaurantById: async (id) => {
    const response = await api.get(`/restaurants/${id}`);
    return response.data;
  },

  getRestaurantMenuItems: async (restaurantId) => {
    const response = await api.get(`/menu-items/restaurant/${restaurantId}`);
    return response.data;
  }
};

export default restaurantService;

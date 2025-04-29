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
  // 🔵 NEW function: Create a restaurant
  createRestaurant: async (restaurantData) => {
    const response = await api.post('/restaurants', restaurantData);
    return response.data;
  },

  getMyRestaurants: async () => {
    const response = await api.get('/restaurants/admin/me');
    return response.data;
  },

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
  },

  createMenuItem: async (menuItemData) => {
    const response = await api.post('/menu-items', menuItemData);
    return response.data;
  },

  updateMenuItem: async (menuItemId, menuItemData) => {
    const response = await api.put(`/menu-items/${menuItemId}`, menuItemData);
    return response.data;
  },

  deleteMenuItem: async (menuItemId) => {
    const response = await api.delete(`/menu-items/${menuItemId}`);
    return response.data;
  },

  getRestaurantMenuItems: async (restaurantId) => {
    const response = await api.get(`/menu-items/restaurant/${restaurantId}`);
    return response.data;
  },


};



export default restaurantService;

// src/services/order.service.js

import axios from 'axios';

const API_URL = import.meta.env.VITE_ORDER_SERVICE_URL || 'http://localhost:3003/api';

const getAuthToken = () => {
  const authData = localStorage.getItem('user');
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      return parsed.token;
    } catch (error) {
      console.error('Failed to parse auth token:', error);
      return null;
    }
  }
  return null;
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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

const orderService = {
  placeOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getMyOrders: async (filters = {}) => {
    const response = await api.get('/orders', { params: filters });
    return response.data;
  },

  getRestaurantOrders: async (restaurantId, filters = {}) => {
    const response = await api.get('/orders/restaurant', {
      params: { restaurantId, ...filters },
    });
    return response.data;
  },

  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  updateOrderStatus: async (orderId, status, cancellationReason = null) => {
    const body = { status };
    if (cancellationReason) {
      body.cancellationReason = cancellationReason;
    }
    const response = await api.put(`/orders/${orderId}/status`, body); // <-- changed to PUT
    return response.data;
  },
  
  cancelOrder: async (orderId, reason) => {
    const response = await api.post(`/orders/${orderId}/cancel`, { reason }); // <-- changed to POST
    return response.data;
  },
  
};

export default orderService;
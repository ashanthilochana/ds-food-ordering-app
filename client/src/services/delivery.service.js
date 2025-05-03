import axios from 'axios';

const API_URL = import.meta.env.VITE_ORDER_SERVICE_URL || 'http://localhost:3003/api';

const getAuthToken = () => {
  const authData = localStorage.getItem('user');
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      return parsed.token;
    } catch (error) {
      console.error('Failed to parse token');
    }
  }
  return null;
};

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const deliveryService = {
  getAllDeliveries: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  getDeliveryById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  // ✅ Use PATCH for status updates
  updateDeliveryStatus: async (orderId, status) => {
    const response = await api.patch(`/deliveries/${orderId}/status`, { status });
    return response.data;
  },

  // Optional: if you use a reason field for cancellation
  cancelDelivery: async (orderId, reason) => {
    const response = await api.post(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  },
};

export default deliveryService;

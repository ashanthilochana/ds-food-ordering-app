import axios from 'axios';

const API_URL = window.env?.REACT_APP_RESTAURANT_SERVICE_URL || 'http://localhost:3001/api';

const restaurantService = {
  // Get all restaurants
  getRestaurants: async (filters = {}) => {
    const response = await axios.get(`${API_URL}/restaurants`, { params: filters });
    return response.data;
  },

  // Get restaurant by ID
  getRestaurantById: async (id) => {
    const response = await axios.get(`${API_URL}/restaurants/${id}`);
    return response.data;
  },

  // Create new restaurant
  createRestaurant: async (restaurantData) => {
    const response = await axios.post(`${API_URL}/restaurants`, restaurantData);
    return response.data;
  },

  // Update restaurant
  updateRestaurant: async (id, restaurantData) => {
    const response = await axios.put(`${API_URL}/restaurants/${id}`, restaurantData);
    return response.data;
  },

  // Delete restaurant
  deleteRestaurant: async (id) => {
    const response = await axios.delete(`${API_URL}/restaurants/${id}`);
    return response.data;
  },

  // Toggle restaurant status
  toggleRestaurantStatus: async (id) => {
    const response = await axios.patch(`${API_URL}/restaurants/${id}/toggle-status`);
    return response.data;
  }
};

export default restaurantService; 
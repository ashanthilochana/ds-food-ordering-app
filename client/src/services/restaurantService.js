import axios from 'axios';

const API_URL = 'http://localhost:3001/api/restaurants';

function getAuthHeader() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    return { Authorization: `Bearer ${user.token}` };
  }
  return {};
}

export const restaurantService = {
  // Add new restaurant
  addRestaurant: async (restaurantData) => {
    try {
      const response = await axios.post(API_URL, restaurantData, {
        headers: { ...getAuthHeader() }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all restaurants
  getAllRestaurants: async (filters = {}) => {
    try {
      const response = await axios.get(API_URL, {
        params: filters,
        headers: { ...getAuthHeader() }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get restaurant by ID
  getRestaurantById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: { ...getAuthHeader() }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update restaurant
  updateRestaurant: async (id, restaurantData) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, restaurantData, {
        headers: { ...getAuthHeader() }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete restaurant
  deleteRestaurant: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`, {
        headers: { ...getAuthHeader() }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Toggle restaurant status
  toggleStatus: async (id) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}/toggle-status`, {}, {
        headers: { ...getAuthHeader() }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}; 
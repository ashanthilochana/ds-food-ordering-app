import axios from 'axios';

const API_URL = 'http://localhost:3001/api/restaurants';

function getAuthHeader() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      console.log('getAuthHeader: using token', user.token);
      return { Authorization: `Bearer ${user.token}` };
    }
    console.error('getAuthHeader: no token found in localStorage');
    return {};
  } catch (error) {
    console.error('getAuthHeader: error parsing user data:', error);
    return {};
  }
}

export const restaurantService = {
  // Add new restaurant
  addRestaurant: async (restaurantData) => {
    try {
      const headers = getAuthHeader();
      console.log('Making request to addRestaurant with headers:', headers);
      const response = await axios.post(API_URL, restaurantData, {
        headers
      });
      return response.data;
    } catch (error) {
      console.error('Error in addRestaurant:', error.response || error);
      throw error.response?.data || error.message;
    }
  },

  // Get all restaurants
  getAllRestaurants: async (filters = {}) => {
    try {
      const headers = getAuthHeader();
      console.log('Making request to getAllRestaurants with headers:', headers);
      const response = await axios.get(API_URL, {
        params: filters,
        headers
      });
      return response.data;
    } catch (error) {
      console.error('Error in getAllRestaurants:', error.response || error);
      throw error.response?.data || error.message;
    }
  },

  // Get restaurant by ID
  getRestaurantById: async (id) => {
    try {
      const headers = getAuthHeader();
      console.log('Making request to getRestaurantById with headers:', headers);
      const response = await axios.get(`${API_URL}/${id}`, {
        headers
      });
      return response.data;
    } catch (error) {
      console.error('Error in getRestaurantById:', error.response || error);
      throw error.response?.data || error.message;
    }
  },

  // Update restaurant
  updateRestaurant: async (id, restaurantData) => {
    try {
      const headers = getAuthHeader();
      console.log('Making request to updateRestaurant with headers:', headers);
      const response = await axios.put(`${API_URL}/${id}`, restaurantData, {
        headers
      });
      return response.data;
    } catch (error) {
      console.error('Error in updateRestaurant:', error.response || error);
      throw error.response?.data || error.message;
    }
  },

  // Delete restaurant
  deleteRestaurant: async (id) => {
    try {
      const headers = getAuthHeader();
      console.log('Making request to deleteRestaurant with headers:', headers);
      const response = await axios.delete(`${API_URL}/${id}`, {
        headers
      });
      return response.data;
    } catch (error) {
      console.error('Error in deleteRestaurant:', error.response || error);
      throw error.response?.data || error.message;
    }
  },

  // Toggle restaurant status
  toggleStatus: async (id) => {
    try {
      const headers = getAuthHeader();
      console.log('Making request to toggleStatus with headers:', headers);
      const response = await axios.patch(`${API_URL}/${id}/toggle-status`, {}, {
        headers
      });
      return response.data;
    } catch (error) {
      console.error('Error in toggleStatus:', error.response || error);
      throw error.response?.data || error.message;
    }
  },

  // Get all restaurants for the logged-in owner
  getMyRestaurants: async () => {
    try {
      const headers = getAuthHeader();
      console.log('Making request to my-restaurants with headers:', headers);
      const response = await axios.get(`${API_URL}/my-restaurants`, {
        headers
      });
      return response.data;
    } catch (error) {
      console.error('Error in getMyRestaurants:', error.response || error);
      throw error.response?.data || error.message;
    }
  }
}; 
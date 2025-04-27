import axios from 'axios';

const API_URL = 'http://localhost:3000/api/menu-items';

export const menuItemService = {
  // Get all menu items
  getAllMenuItems: async (filters = {}) => {
    try {
      const response = await axios.get(API_URL, { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get menu item by ID
  getMenuItemById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new menu item
  createMenuItem: async (menuItemData) => {
    try {
      const response = await axios.post(API_URL, menuItemData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update menu item
  updateMenuItem: async (id, menuItemData) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, menuItemData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete menu item
  deleteMenuItem: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Toggle menu item availability
  toggleAvailability: async (id) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}/toggle-availability`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}; 
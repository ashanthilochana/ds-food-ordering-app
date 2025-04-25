import apiClient, { API_URLS } from './api.config';

class RestaurantService {
  // Get all restaurants with optional filters
  async getRestaurants(filters = {}) {
    const response = await apiClient.get(API_URLS.RESTAURANT, { params: filters });
    return response.data;
  }

  // Get restaurant by ID
  async getRestaurantById(id) {
    const response = await apiClient.get(`${API_URLS.RESTAURANT}/${id}`);
    return response.data;
  }

  // Get menu items for a restaurant
  async getMenuItems(restaurantId) {
    const response = await apiClient.get(`${API_URLS.RESTAURANT}/menu-items/restaurant/${restaurantId}`);
    return response.data;
  }

  // Get menu item by ID
  async getMenuItemById(id) {
    const response = await apiClient.get(`${API_URLS.RESTAURANT}/menu-items/${id}`);
    return response.data;
  }

  // Restaurant Admin Methods
  async createRestaurant(restaurantData) {
    const response = await apiClient.post(API_URLS.RESTAURANT, restaurantData);
    return response.data;
  }

  async updateRestaurant(id, restaurantData) {
    const response = await apiClient.put(`${API_URLS.RESTAURANT}/${id}`, restaurantData);
    return response.data;
  }

  async deleteRestaurant(id) {
    const response = await apiClient.delete(`${API_URLS.RESTAURANT}/${id}`);
    return response.data;
  }

  async toggleRestaurantStatus(id) {
    const response = await apiClient.patch(`${API_URLS.RESTAURANT}/${id}/toggle-status`);
    return response.data;
  }

  // Menu Item Management
  async createMenuItem(menuItemData) {
    const response = await apiClient.post(`${API_URLS.RESTAURANT}/menu-items`, menuItemData);
    return response.data;
  }

  async updateMenuItem(id, menuItemData) {
    const response = await apiClient.put(`${API_URLS.RESTAURANT}/menu-items/${id}`, menuItemData);
    return response.data;
  }

  async deleteMenuItem(id) {
    const response = await apiClient.delete(`${API_URLS.RESTAURANT}/menu-items/${id}`);
    return response.data;
  }

  async toggleItemAvailability(id) {
    const response = await apiClient.patch(`${API_URLS.RESTAURANT}/menu-items/${id}/toggle-availability`);
    return response.data;
  }
}

export default new RestaurantService(); 
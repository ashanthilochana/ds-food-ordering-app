import apiClient, { API_URLS } from './api.config';

class OrderService {
  // Create a new order
  async createOrder(orderData) {
    const response = await apiClient.post(API_URLS.ORDER, orderData);
    return response.data;
  }

  // Get all orders with filters (for customer or restaurant)
  async getOrders(filters = {}) {
    const response = await apiClient.get(API_URLS.ORDER, { params: filters });
    return response.data;
  }

  // Get order by ID
  async getOrderById(id) {
    const response = await apiClient.get(`${API_URLS.ORDER}/${id}`);
    return response.data;
  }

  // Update order status (for restaurant or delivery)
  async updateOrderStatus(id, status, notes = '') {
    const response = await apiClient.put(`${API_URLS.ORDER}/${id}`, {
      status,
      notes,
    });
    return response.data;
  }

  // Cancel order (for customer)
  async cancelOrder(id, reason) {
    const response = await apiClient.post(`${API_URLS.ORDER}/${id}/cancel`, {
      reason,
    });
    return response.data;
  }

  // Get order history for customer
  async getOrderHistory(params = {}) {
    const response = await apiClient.get(`${API_URLS.ORDER}/history`, {
      params,
    });
    return response.data;
  }

  // Track order status
  async trackOrder(id) {
    const response = await apiClient.get(`${API_URLS.ORDER}/${id}/track`);
    return response.data;
  }

  // Rate and review order
  async rateOrder(id, rating, review) {
    const response = await apiClient.post(`${API_URLS.ORDER}/${id}/rate`, {
      rating,
      review,
    });
    return response.data;
  }
}

export default new OrderService(); 
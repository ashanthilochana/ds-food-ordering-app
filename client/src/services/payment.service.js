import apiClient, { API_URLS } from './api.config';

class PaymentService {
  // Create payment intent
  async createPaymentIntent(orderData) {
    const response = await apiClient.post(`${API_URLS.PAYMENT}/create-payment`, orderData);
    return response.data;
  }

  // Process payment
  async processPayment(paymentData) {
    const response = await apiClient.post(`${API_URLS.PAYMENT}/process-payment`, paymentData);
    return response.data;
  }

  // Get payment history
  async getPaymentHistory(filters = {}) {
    const response = await apiClient.get(`${API_URLS.PAYMENT}/payment-history`, {
      params: filters,
    });
    return response.data;
  }

  // Get payment details
  async getPaymentDetails(paymentId) {
    const response = await apiClient.get(`${API_URLS.PAYMENT}/payment/${paymentId}`);
    return response.data;
  }

  // Request refund
  async requestRefund(paymentId, reason) {
    const response = await apiClient.post(`${API_URLS.PAYMENT}/refund`, {
      paymentId,
      reason,
    });
    return response.data;
  }

  // Save payment method
  async savePaymentMethod(paymentMethod) {
    const response = await apiClient.post(`${API_URLS.PAYMENT}/save-payment-method`, paymentMethod);
    return response.data;
  }

  // Get saved payment methods
  async getSavedPaymentMethods() {
    const response = await apiClient.get(`${API_URLS.PAYMENT}/payment-methods`);
    return response.data;
  }

  // Delete saved payment method
  async deletePaymentMethod(paymentMethodId) {
    const response = await apiClient.delete(`${API_URLS.PAYMENT}/payment-methods/${paymentMethodId}`);
    return response.data;
  }
}

export default new PaymentService(); 
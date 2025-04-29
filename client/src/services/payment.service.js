import axios from 'axios';

const API_URL =  'http://localhost:3008/api';

class PaymentService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Set auth token for requests
  setAuthToken(token) {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.common['Authorization'];
    }
  }

  // Get Stripe publishable key
  async getPublishableKey() {
    try {
      const response = await this.api.get('/payments/config');
      return response.data.publishableKey;
    } catch (error) {
      console.error('Error getting publishable key:', error);
      throw error;
    }
  }

  // Create payment intent
  async createPaymentIntent(orderId, paymentMethod) {
    try {
      const response = await this.api.post('/payments/create-intent', {
        orderId,
        paymentMethod,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  // Confirm payment
  async confirmPayment(paymentIntentId, orderId) {
    try {
      const response = await this.api.post('/payments/confirm', {
        paymentIntentId,
        orderId,
      });
      return response.data;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  // Get payment by ID
  async getPaymentById(paymentId) {
    try {
      const response = await this.api.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting payment:', error);
      throw error;
    }
  }

  // Get payments with filters
  async getPayments(filters = {}) {
    try {
      const response = await this.api.get('/payments', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error getting payments:', error);
      throw error;
    }
  }

  // Retry failed payment
  async retryPayment(paymentId) {
    try {
      const response = await this.api.post(`/payments/${paymentId}/retry`);
      return response.data;
    } catch (error) {
      console.error('Error retrying payment:', error);
      throw error;
    }
  }

  // Create Stripe Checkout Session
  async createCheckoutSession(items, success_url, cancel_url) {
    try {
      const response = await this.api.post('/payments/create-checkout-session', {
        items,
        success_url,
        cancel_url,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating Stripe checkout session:', error);
      throw error;
    }
  }

  // Example: Adjust the endpoint to match your backend API
  async getPaymentBySessionId(sessionId) {
    const response = await fetch(`/api/payments/session/${sessionId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch payment by session ID');
    }
    return response.json();
  }
}

export default new PaymentService(); 
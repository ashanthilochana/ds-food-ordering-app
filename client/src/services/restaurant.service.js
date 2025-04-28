import axios from 'axios';

const API_URL = window.env?.REACT_APP_RESTAURANT_SERVICE_URL || 'http://localhost:3001/api';

// Get token from localStorage
const getAuthToken = () => {
  const authData = localStorage.getItem('user');
  console.log('Auth data from localStorage:', authData);
  if (authData) {
    try {
      const parsedData = JSON.parse(authData);
      console.log('Parsed auth data:', parsedData);
      return parsedData.token;
    } catch (error) {
      console.error('Error parsing auth data:', error);
      return null;
    }
  }
  return null;
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    console.log('Token retrieved:', token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Request headers:', config.headers);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
    return Promise.reject(error);
  }
);

const restaurantService = {
  // Get all restaurants
  getRestaurants: async (filters = {}) => {
    const response = await api.get('/restaurants', { params: filters });
    return response.data;
  },

  // Get restaurants by admin ID
  getRestaurantsByAdminId: async () => {
    const response = await api.get('/restaurants/admin/me');
    return response.data;
  },

  // Get restaurant by ID
  getRestaurantById: async (id) => {
    const response = await api.get(`/restaurants/${id}`);
    return response.data;
  },

  // Get restaurant orders
  getRestaurantOrders: async (restaurantId) => {
    const response = await api.get(`/restaurants/${restaurantId}/orders`);
    return response.data;
  },

  // Get restaurant menu items
  getRestaurantMenuItems: async (restaurantId) => {
    const response = await api.get(`/restaurants/${restaurantId}/menu-items`);
    return response.data;
  },

  // Create new menu item
  createMenuItem: async (restaurantId, menuItemData) => {
    const response = await api.post(`/restaurants/${restaurantId}/menu-items`, menuItemData);
    return response.data;
  },

  // Update menu item
  updateMenuItem: async (restaurantId, menuItemId, menuItemData) => {
    const response = await api.put(`/restaurants/${restaurantId}/menu-items/${menuItemId}`, menuItemData);
    return response.data;
  },

  // Delete menu item
  deleteMenuItem: async (restaurantId, menuItemId) => {
    const response = await api.delete(`/restaurants/${restaurantId}/menu-items/${menuItemId}`);
    return response.data;
  },

  // Create new restaurant
  createRestaurant: async (restaurantData) => {
    // Transform the data to match backend requirements
    const formattedData = {
      name: restaurantData.name.trim(),
      description: restaurantData.description,
      address: {
        street: restaurantData.address.street,
        city: restaurantData.address.city,
        state: restaurantData.address.state,
        zipCode: restaurantData.address.zipCode,
        country: restaurantData.address.country
      },
      cuisine: Array.isArray(restaurantData.cuisine) 
        ? restaurantData.cuisine 
        : [restaurantData.cuisine],
      priceRange: restaurantData.priceRange || 'moderate',
      contactInfo: {
        email: restaurantData.contactInfo.email,
        phone: restaurantData.contactInfo.phone
      },
      openingHours: restaurantData.openingHours,
      deliveryTime: restaurantData.deliveryTime,
      deliveryFee: restaurantData.deliveryFee,
      minOrder: restaurantData.minOrder
    };

    // Validate required fields
    if (!formattedData.name) {
      throw new Error('Restaurant name is required');
    }
    if (!formattedData.description) {
      throw new Error('Restaurant description is required');
    }
    if (!formattedData.address || !formattedData.address.street) {
      throw new Error('Restaurant address is required');
    }
    if (!formattedData.cuisine || formattedData.cuisine.length === 0) {
      throw new Error('At least one cuisine type is required');
    }
    if (!['budget', 'moderate', 'expensive', 'luxury'].includes(formattedData.priceRange)) {
      throw new Error('Invalid price range. Must be one of: budget, moderate, expensive, luxury');
    }

    console.log('Sending formatted data:', formattedData);
    const response = await api.post('/restaurants', formattedData);
    return response.data;
  },

  // Update restaurant
  updateRestaurant: async (id, restaurantData) => {
    const response = await api.put(`/restaurants/${id}`, restaurantData);
    return response.data;
  },

  // Delete restaurant
  deleteRestaurant: async (id) => {
    const response = await api.delete(`/restaurants/${id}`);
    return response.data;
  },

  // Toggle restaurant status
  toggleRestaurantStatus: async (id) => {
    const response = await api.patch(`/restaurants/${id}/toggle-status`);
    return response.data;
  }
};

export default restaurantService; 
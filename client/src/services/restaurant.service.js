import axios from 'axios';

const API_URL = window.env?.REACT_APP_RESTAURANT_SERVICE_URL || 'http://localhost:3001/api';

const getAuthToken = () => {
  const authData = localStorage.getItem('user');
  if (authData) {
    try {
      const parsedData = JSON.parse(authData);
      return parsedData.token;
    } catch (error) {
      console.error('Error parsing auth data:', error);
      return null;
    }
  }
  return null;
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
  getRestaurants: async (filters = {}) => {
    const response = await api.get('/restaurants', { params: filters });
    return response.data;
  },

  getRestaurantsByAdminId: async () => {
    const response = await api.get('/restaurants/admin/me');
    return response.data;
  },

  getRestaurantById: async (id) => {
    const response = await api.get(`/restaurants/${id}`);
    return response.data;
  },

  getRestaurantOrders: async (restaurantId) => {
    const response = await api.get(`/restaurants/${restaurantId}/orders`);
    return response.data;
  },

  // Menu Item APIs (updated)
  getRestaurantMenuItems: async (restaurantId) => {
    const response = await api.get(`/menu-items/restaurant/${restaurantId}`);
    return response.data;
  },

  createMenuItem: async (restaurantId, menuItemData) => {
    const response = await api.post('/menu-items', { ...menuItemData, restaurant: restaurantId });
    return response.data;
  },

  updateMenuItem: async (restaurantId, menuItemId, menuItemData) => {
    const response = await api.put(`/menu-items/${menuItemId}`, menuItemData);
    return response.data;
  },

  deleteMenuItem: async (restaurantId, menuItemId) => {
    const response = await api.delete(`/menu-items/${menuItemId}`);
    return response.data;
  },

  createRestaurant: async (restaurantData) => {
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
      cuisine: Array.isArray(restaurantData.cuisine) ? restaurantData.cuisine : [restaurantData.cuisine],
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

    if (!formattedData.name || !formattedData.description || !formattedData.address.street || !formattedData.cuisine.length) {
      throw new Error('Missing required fields for restaurant creation');
    }

    const response = await api.post('/restaurants', formattedData);
    return response.data;
  },

  updateRestaurant: async (id, restaurantData) => {
    const response = await api.put(`/restaurants/${id}`, restaurantData);
    return response.data;
  },

  deleteRestaurant: async (id) => {
    const response = await api.delete(`/restaurants/${id}`);
    return response.data;
  },

  toggleRestaurantStatus: async (id) => {
    const response = await api.patch(`/restaurants/${id}/toggle-status`);
    return response.data;
  }
};

export default restaurantService;

import axios from '../utils/axios';

const API_URL = '/api/auth';  // Use relative URL to work with Vite proxy

const login = async (email, password) => {
  try {
    console.log('Attempting login with:', { email });
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password,
    });
    
    console.log('Login response:', response.data);
    
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
      console.log('User data saved to localStorage');
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response || error);
    throw error.response?.data?.message || 'An error occurred during login';
  }
};

const logout = () => {
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) return JSON.parse(userStr);
  return null;
};

export default {
  login,
  logout,
  getCurrentUser,
};

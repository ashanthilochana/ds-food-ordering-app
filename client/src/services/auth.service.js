import axios from '../utils/axios';

const API_URL = "http://localhost:3002/api/auth/";

const register = async (email, password, name, role = "customer") => {
  try {
    const response = await fetch(`${API_URL}register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        name,
        role
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

const login = async (email, password) => {
  try {
    console.log(`Attempting to login at: ${API_URL}login`);
    const response = await fetch(`${API_URL}login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    if (data.token) {
      // Store both token and user data
      const userData = {
        ...data.user,
        token: data.token
      };
      localStorage.setItem("user", JSON.stringify(userData));
      console.log('Stored user data:', userData);
    }
    return data;
  } catch (error) {
    console.error('Auth service login error:', error);
    throw error;
  }
};

const logout = () => {
  localStorage.removeItem("user");
};

const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
};

export default authService;

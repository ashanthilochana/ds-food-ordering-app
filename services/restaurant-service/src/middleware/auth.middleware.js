const axios = require('axios');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3002';

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    console.log('Validating token with Auth Service...');
    
    // Validate token with Auth Service
    const response = await axios.get(`${AUTH_SERVICE_URL}/api/auth/validate-token`, {
      headers: { Authorization: token }
    });

    console.log('Auth Service response:', response.data);

    if (!response.data || !response.data.user) {
      console.error('Invalid response from Auth Service:', response.data);
      return res.status(401).json({ message: 'Invalid user data from Auth Service' });
    }

    // Add user data to request
    req.user = {
      id: response.data.user._id || response.data.user.id,
      role: response.data.user.role
    };
    console.log('User data set in request:', req.user);
    
    next();
  } catch (error) {
    console.error('Auth error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({ message: 'Error validating token' });
  }
};

// Middleware to check if user is restaurant owner
const isRestaurantOwner = async (req, res, next) => {
  try {
    console.log('Checking restaurant owner role. User:', req.user);
    
    if (!req.user || req.user.role !== 'restaurant_admin') {
      console.log('Access denied. User role:', req.user?.role);
      return res.status(403).json({ message: 'Access denied. Not a restaurant owner.' });
    }
    next();
  } catch (error) {
    console.error('Restaurant owner check error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { auth, isRestaurantOwner };

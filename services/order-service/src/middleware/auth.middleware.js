const axios = require('axios');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3002';

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Validate token with Auth Service
    const response = await axios.get(`${AUTH_SERVICE_URL}/api/auth/validate-token`, {
      headers: { Authorization: token }
    });

    // Add user data to request
    req.user = response.data.user;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({ message: 'Error validating token' });
  }
};

// Check if user is a customer
const isCustomer = async (req, res, next) => {
  if (!req.user || req.user.role !== 'customer') {
    return res.status(403).json({ message: 'Access denied. Not a customer.' });
  }
  next();
};

// Check if user is restaurant owner
const isRestaurantOwner = async (req, res, next) => {
  if (!req.user || req.user.role !== 'restaurant_admin') {
    return res.status(403).json({ message: 'Access denied. Not a restaurant owner.' });
  }
  next();
};

// Check if user is delivery person
const isDeliveryPerson = async (req, res, next) => {
  if (!req.user || req.user.role !== 'delivery_person') {
    return res.status(403).json({ message: 'Access denied. Not a delivery person.' });
  }
  next();
};

// Check if user is admin
const isAdmin = async (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Not an admin.' });
  }
  next();
};

module.exports = {
  auth,
  isCustomer,
  isRestaurantOwner,
  isDeliveryPerson,
  isAdmin
};

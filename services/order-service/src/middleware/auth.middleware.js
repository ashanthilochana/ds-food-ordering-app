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
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    if (req.user.role !== 'customer') {
      console.error('Role check failed:', {
        expected: 'customer',
        received: req.user.role,
        userId: req.user._id
      });
      return res.status(403).json({ 
        message: 'Access denied. Not a customer.',
        details: {
          expectedRole: 'customer',
          currentRole: req.user.role
        }
      });
    }
    next();
  } catch (error) {
    console.error('isCustomer middleware error:', error);
    res.status(500).json({ message: 'Error checking customer role' });
  }
};

// Check if user is restaurant owner
const isRestaurantOwner = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    if (req.user.role !== 'restaurant_admin') {
      console.error('Role check failed:', {
        expected: 'restaurant_admin',
        received: req.user.role,
        userId: req.user._id
      });
      return res.status(403).json({ 
        message: 'Access denied. Not a restaurant owner.',
        details: {
          expectedRole: 'restaurant_admin',
          currentRole: req.user.role
        }
      });
    }
    next();
  } catch (error) {
    console.error('isRestaurantOwner middleware error:', error);
    res.status(500).json({ message: 'Error checking restaurant owner role' });
  }
};

// Check if user is delivery person
const isDeliveryPerson = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    if (req.user.role !== 'delivery_person') {
      console.error('Role check failed:', {
        expected: 'delivery_person',
        received: req.user.role,
        userId: req.user._id
      });
      return res.status(403).json({ 
        message: 'Access denied. Not a delivery person.',
        details: {
          expectedRole: 'delivery_person',
          currentRole: req.user.role
        }
      });
    }
    next();
  } catch (error) {
    console.error('isDeliveryPerson middleware error:', error);
    res.status(500).json({ message: 'Error checking delivery person role' });
  }
};

// Check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    if (req.user.role !== 'admin') {
      console.error('Role check failed:', {
        expected: 'admin',
        received: req.user.role,
        userId: req.user._id
      });
      return res.status(403).json({ 
        message: 'Access denied. Not an admin.',
        details: {
          expectedRole: 'admin',
          currentRole: req.user.role
        }
      });
    }
    next();
  } catch (error) {
    console.error('isAdmin middleware error:', error);
    res.status(500).json({ message: 'Error checking admin role' });
  }
};

module.exports = {
  auth,
  isCustomer,
  isRestaurantOwner,
  isDeliveryPerson,
  isAdmin
};

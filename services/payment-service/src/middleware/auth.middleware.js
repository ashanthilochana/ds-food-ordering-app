const jwt = require('jsonwebtoken');
const axios = require('axios');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_123';

exports.auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token provided' });
    }

    try {
      // Verify token locally
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get user details from Auth Service
      const response = await axios.get(`${process.env.AUTH_SERVICE_URL}/api/auth/users/${decoded.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      req.user = response.data;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
      if (error.response?.status === 404) {
        return res.status(401).json({ message: 'User not found' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

// Middleware to check if user is a customer
exports.isCustomer = (req, res, next) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ message: 'Access denied. Not a customer.' });
  }
  next();
};

// Middleware to check if user is a restaurant owner
exports.isRestaurantOwner = (req, res, next) => {
  if (req.user.role !== 'restaurant_admin') {
    return res.status(403).json({ message: 'Access denied. Not a restaurant owner.' });
  }
  next();
};

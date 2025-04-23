const jwt = require('jsonwebtoken');
const axios = require('axios');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_123';
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3002';

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      // Extract token
      const token = authHeader.replace('Bearer ', '');
      
      // Verify token locally
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get user details from Auth Service
      const response = await axios.get(
        `${AUTH_SERVICE_URL}/api/auth/users/${decoded.id}`,
        { headers: { Authorization: authHeader } }
      );
      
      if (!response.data) {
        return res.status(401).json({ message: 'User not found' });
      }

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

// Middleware to check if user is restaurant owner
const isRestaurantOwner = async (req, res, next) => {
  try {
    if (req.user.role !== 'restaurant_admin') {
      return res.status(403).json({ message: 'Access denied. Not a restaurant owner.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { auth, isRestaurantOwner };

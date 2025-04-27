const Restaurant = require('../models/restaurant.model');
const { validationResult } = require('express-validator');

// Create a new restaurant
exports.createRestaurant = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    console.log('Creating restaurant with user:', req.user);

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User ID not found' });
    }

    const restaurantData = {
      ...req.body,
      owner: req.user.id, // Using id from Auth Service user object
      contactInfo: {
        ...req.body.contactInfo,
        email: req.user.email || '' // Use the authenticated user's email if available
      }
    };

    console.log('Restaurant data to save:', restaurantData);
    const restaurant = new Restaurant(restaurantData);

    await restaurant.save();
    res.status(201).json(restaurant);
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all restaurants with filtering and pagination
exports.getRestaurants = async (req, res) => {
  try {
    const { cuisine, priceRange, rating, search } = req.query;
    const query = {};

    // Only show restaurants for the logged-in owner if role is restaurant_owner
    if (req.user && req.user.role === 'restaurant_owner' && req.user._id) {
      query.owner = req.user._id;
    }

    if (cuisine) query['cuisine'] = { $in: [cuisine] };
    if (priceRange) query.priceRange = priceRange;
    if (rating) query.rating = { $gte: parseFloat(rating) };
    if (search) {
      query.$text = { $search: search };
    }

    const restaurants = await Restaurant.find(query);
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get restaurant by ID
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update restaurant
exports.updateRestaurant = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Check if user is the owner
    if (restaurant.owner.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedRestaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete restaurant
exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Check if user is the owner
    if (restaurant.owner.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Restaurant.findByIdAndDelete(req.params.id);
    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle restaurant active status
exports.toggleRestaurantStatus = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Check if user is the owner
    if (restaurant.owner.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    restaurant.isActive = !restaurant.isActive;
    await restaurant.save();

    res.json({ message: `Restaurant is now ${restaurant.isActive ? 'active' : 'inactive'}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all restaurants for the logged-in owner
exports.getRestaurantsByOwner = async (req, res) => {
  try {
    console.log('getRestaurantsByOwner - User:', req.user);
    
    if (!req.user) {
      console.error('No user object in request');
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    if (req.user.role !== 'restaurant_admin') {
      console.error('Invalid user role:', req.user.role);
      return res.status(403).json({ message: 'Not authorized. Must be a restaurant admin.' });
    }
    
    if (!req.user.id) {
      console.error('No user ID in request');
      return res.status(401).json({ message: 'Invalid user data' });
    }

    console.log('Finding restaurants for owner:', req.user.id);
    const restaurants = await Restaurant.find({ owner: req.user.id });
    console.log('Found restaurants:', restaurants);
    
    res.json(restaurants);
  } catch (error) {
    console.error('Error in getRestaurantsByOwner:', error);
    res.status(500).json({ message: error.message });
  }
};

const Restaurant = require('../models/restaurant.model');
const { validationResult } = require('express-validator');

// Create a new restaurant
exports.createRestaurant = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const restaurantData = {
      ...req.body,
      owner: req.user._id, // Using _id from Auth Service user object
      contactInfo: {
        ...req.body.contactInfo,
        email: req.user.email // Use the authenticated user's email
      }
    };

    const restaurant = new Restaurant(restaurantData);

    await restaurant.save();
    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all restaurants with filtering and pagination
exports.getRestaurants = async (req, res) => {
  try {
    const { cuisine, priceRange, rating, search } = req.query;
    const query = {};

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

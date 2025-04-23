const { body, param, query } = require('express-validator');

// Restaurant validation rules
const createRestaurantRules = [
  body('name').notEmpty().trim().withMessage('Restaurant name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('address').isObject().withMessage('Address must be an object'),
  body('address.street').notEmpty().withMessage('Street address is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.country').notEmpty().withMessage('Country is required'),
  body('cuisine').isArray().withMessage('Cuisine must be an array'),
  body('priceRange').isIn(['$', '$$', '$$$', '$$$$']).withMessage('Invalid price range'),
  body('contactInfo.email').isEmail().withMessage('Valid email is required'),
  body('contactInfo.phone').optional().matches(/^\+?[\d\s-]+$/).withMessage('Invalid phone number format')
];

const updateRestaurantRules = [
  param('id').isMongoId().withMessage('Invalid restaurant ID'),
  body('name').optional().trim().notEmpty().withMessage('Restaurant name cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('address').optional().isObject().withMessage('Address must be an object'),
  body('cuisine').optional().isArray().withMessage('Cuisine must be an array'),
  body('priceRange').optional().isIn(['$', '$$', '$$$', '$$$$']).withMessage('Invalid price range'),
  body('contactInfo.email').optional().isEmail().withMessage('Valid email is required'),
  body('contactInfo.phone').optional().matches(/^\+?[\d\s-]+$/).withMessage('Invalid phone number format')
];

// Menu item validation rules
const createMenuItemRules = [
  body('restaurant').isMongoId().withMessage('Valid restaurant ID is required'),
  body('name').notEmpty().trim().withMessage('Menu item name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isIn(['appetizer', 'main', 'dessert', 'beverage', 'side']).withMessage('Invalid category'),
  body('ingredients').isArray().withMessage('Ingredients must be an array'),
  body('preparationTime').isInt({ min: 1 }).withMessage('Preparation time must be a positive integer')
];

const updateMenuItemRules = [
  param('id').isMongoId().withMessage('Invalid menu item ID'),
  body('name').optional().trim().notEmpty().withMessage('Menu item name cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').optional().isIn(['appetizer', 'main', 'dessert', 'beverage', 'side']).withMessage('Invalid category'),
  body('ingredients').optional().isArray().withMessage('Ingredients must be an array'),
  body('preparationTime').optional().isInt({ min: 1 }).withMessage('Preparation time must be a positive integer')
];

// Query validation rules
const listRestaurantsRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('cuisine').optional().isString().withMessage('Cuisine must be a string'),
  query('priceRange').optional().isIn(['$', '$$', '$$$', '$$$$']).withMessage('Invalid price range'),
  query('rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5')
];

const listMenuItemsRules = [
  param('restaurantId').isMongoId().withMessage('Invalid restaurant ID'),
  query('category').optional().isIn(['appetizer', 'main', 'dessert', 'beverage', 'side']).withMessage('Invalid category'),
  query('isAvailable').optional().isBoolean().withMessage('isAvailable must be a boolean'),
  query('isVegetarian').optional().isBoolean().withMessage('isVegetarian must be a boolean'),
  query('isVegan').optional().isBoolean().withMessage('isVegan must be a boolean')
];

module.exports = {
  createRestaurantRules,
  updateRestaurantRules,
  createMenuItemRules,
  updateMenuItemRules,
  listRestaurantsRules,
  listMenuItemsRules
};

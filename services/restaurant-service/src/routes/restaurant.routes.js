const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const restaurantController = require('../controllers/restaurant.controller');
const { auth, isRestaurantOwner } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/restaurants:
 *   post:
 *     summary: Create a new restaurant
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Restaurant'
 *     responses:
 *       201:
 *         description: Restaurant created successfully
 */
router.post(
  '/',
  auth,
  isRestaurantOwner,
  [
    body('name').notEmpty().trim(),
    body('description').notEmpty(),
    body('address').isObject(),
    body('cuisine').isArray(),
    body('priceRange').isIn(['budget', 'moderate', 'expensive', 'luxury']),
  ],
  restaurantController.createRestaurant
);

/**
 * @swagger
 * /api/restaurants:
 *   get:
 *     summary: Get all restaurants
 *     tags: [Restaurants]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of restaurants
 */
router.get('/', restaurantController.getRestaurants);

/**
 * @swagger
 * /api/restaurants/{id}:
 *   get:
 *     summary: Get restaurant by ID
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Restaurant details
 */
router.get('/:id', restaurantController.getRestaurantById);

/**
 * @swagger
 * /api/restaurants/{id}:
 *   put:
 *     summary: Update restaurant
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Restaurant'
 *     responses:
 *       200:
 *         description: Restaurant updated successfully
 */
router.put(
  '/:id',
  auth,
  isRestaurantOwner,
  [
    body('name').optional().trim(),
    body('description').optional(),
    body('address').optional().isObject(),
    body('cuisine').optional().isArray(),
    body('priceRange').optional().isIn(['budget', 'moderate', 'expensive', 'luxury']),
    body('contactInfo.email').optional().isEmail(),
  ],
  restaurantController.updateRestaurant
);

/**
 * @swagger
 * /api/restaurants/{id}:
 *   delete:
 *     summary: Delete restaurant
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Restaurant deleted successfully
 */
router.delete('/:id', auth, restaurantController.deleteRestaurant);

/**
 * @swagger
 * /api/restaurants/{id}/toggle-status:
 *   patch:
 *     summary: Toggle restaurant active status
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Restaurant status toggled successfully
 */
router.patch('/:id/toggle-status', auth, restaurantController.toggleRestaurantStatus);

/**
 * @swagger
 * /api/restaurants/admin/me:
 *   get:
 *     summary: Get restaurants by admin ID
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of restaurants owned by the admin
 */
router.get('/admin/me', auth, isRestaurantOwner, restaurantController.getRestaurantsByAdminId);

module.exports = router;

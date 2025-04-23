const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const menuItemController = require('../controllers/menuItem.controller');
const { auth } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/menu-items:
 *   post:
 *     summary: Create a new menu item
 *     tags: [Menu Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MenuItem'
 *     responses:
 *       201:
 *         description: Menu item created successfully
 */
router.post(
  '/',
  auth,
  [
    body('restaurant').notEmpty().isMongoId(),
    body('name').notEmpty().trim(),
    body('description').notEmpty(),
    body('price').isFloat({ min: 0 }),
    body('category').isIn(['appetizer', 'main', 'dessert', 'beverage', 'side']),
    body('ingredients').isArray(),
    body('preparationTime').isInt({ min: 1 }),
  ],
  menuItemController.createMenuItem
);

/**
 * @swagger
 * /api/menu-items/restaurant/{restaurantId}:
 *   get:
 *     summary: Get menu items by restaurant
 *     tags: [Menu Items]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of menu items
 */
router.get('/restaurant/:restaurantId', menuItemController.getMenuItems);

/**
 * @swagger
 * /api/menu-items/{id}:
 *   get:
 *     summary: Get menu item by ID
 *     tags: [Menu Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Menu item details
 */
router.get('/:id', menuItemController.getMenuItemById);

/**
 * @swagger
 * /api/menu-items/{id}:
 *   put:
 *     summary: Update menu item
 *     tags: [Menu Items]
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
 *             $ref: '#/components/schemas/MenuItem'
 *     responses:
 *       200:
 *         description: Menu item updated successfully
 */
router.put(
  '/:id',
  auth,
  [
    body('name').optional().trim(),
    body('description').optional(),
    body('price').optional().isFloat({ min: 0 }),
    body('category').optional().isIn(['appetizer', 'main', 'dessert', 'beverage', 'side']),
    body('ingredients').optional().isArray(),
    body('preparationTime').optional().isInt({ min: 1 }),
  ],
  menuItemController.updateMenuItem
);

/**
 * @swagger
 * /api/menu-items/{id}:
 *   delete:
 *     summary: Delete menu item
 *     tags: [Menu Items]
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
 *         description: Menu item deleted successfully
 */
router.delete('/:id', auth, menuItemController.deleteMenuItem);

/**
 * @swagger
 * /api/menu-items/{id}/toggle-availability:
 *   patch:
 *     summary: Toggle menu item availability
 *     tags: [Menu Items]
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
 *         description: Menu item availability toggled successfully
 */
router.patch('/:id/toggle-availability', auth, menuItemController.toggleAvailability);

module.exports = router;

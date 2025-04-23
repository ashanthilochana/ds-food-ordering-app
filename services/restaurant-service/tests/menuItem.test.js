const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/user.model');
const Restaurant = require('../src/models/restaurant.model');
const MenuItem = require('../src/models/menuItem.model');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

describe('Menu Item Endpoints', () => {
  let authToken;
  let restaurant;
  let user;

  const testUser = {
    email: 'restaurant@example.com',
    password: 'Test123!',
    name: 'Restaurant Owner',
    role: 'restaurant_admin'
  };

  const testRestaurant = {
    name: 'Test Restaurant',
    description: 'Test Description',
    address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345'
    },
    cuisine: ['italian'],
    priceRange: 'moderate',
    contactInfo: {
      email: 'restaurant@example.com',
      phone: '+1234567890'
    }
  };

  const testMenuItem = {
    name: 'Test Pizza',
    description: 'Delicious test pizza',
    price: 12.99,
    category: 'main',
    ingredients: ['cheese', 'tomato sauce'],
    preparationTime: 20,
    isAvailable: true
  };

  let mockAxios;

  beforeEach(async () => {
    mockAxios = new MockAdapter(axios);
    user = await User.create(testUser);
    authToken = 'mock-token';

    // Mock Auth Service response
    mockAxios.onGet(`${process.env.AUTH_SERVICE_URL || 'http://localhost:3002'}/api/auth/validate-token`)
      .reply(200, {
        user: {
          _id: user._id,
          email: testUser.email,
          name: testUser.name,
          role: 'restaurant_admin'
        }
      });

    testRestaurant.owner = user._id;
    restaurant = await Restaurant.create(testRestaurant);
    testMenuItem.restaurant = restaurant._id;
  });

  describe('POST /api/menu-items', () => {
    it('should create a new menu item', async () => {
      const res = await request(app)
        .post('/api/menu-items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testMenuItem);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('name', testMenuItem.name);
      expect(res.body).toHaveProperty('restaurant', restaurant._id.toString());
    });

    it('should not create menu item without authentication', async () => {
      const res = await request(app)
        .post('/api/menu-items')
        .send(testMenuItem);

      expect(res.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/menu-items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Pizza'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/menu-items/restaurant/:restaurantId', () => {
    beforeEach(async () => {
      await MenuItem.create(testMenuItem);
    });

    it('should get restaurant menu items', async () => {
      const res = await request(app)
        .get(`/api/menu-items/restaurant/${restaurant._id}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBe(1);
      expect(res.body[0]).toHaveProperty('name', testMenuItem.name);
    });

    it('should filter by category', async () => {
      const res = await request(app)
        .get(`/api/menu-items/restaurant/${restaurant._id}`)
        .query({ category: 'main' });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body[0]).toHaveProperty('category', 'main');
    });
  });

  describe('PUT /api/menu-items/:id', () => {
    let menuItem;

    beforeEach(async () => {
      menuItem = await MenuItem.create(testMenuItem);
    });

    it('should update menu item', async () => {
      const res = await request(app)
        .put(`/api/menu-items/${menuItem._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Pizza',
          price: 14.99
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', 'Updated Pizza');
      expect(res.body).toHaveProperty('price', 14.99);
    });

    it('should not update menu item without authentication', async () => {
      const res = await request(app)
        .put(`/api/menu-items/${menuItem._id}`)
        .send({
          name: 'Updated Pizza'
        });

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/menu-items/:id', () => {
    let menuItem;

    beforeEach(async () => {
      menuItem = await MenuItem.create(testMenuItem);
    });

    it('should delete menu item', async () => {
      const res = await request(app)
        .delete(`/api/menu-items/${menuItem._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Menu item deleted');

      const deletedItem = await MenuItem.findById(menuItem._id);
      expect(deletedItem).toBeNull();
    });

    it('should not delete menu item without authentication', async () => {
      const res = await request(app)
        .delete(`/api/menu-items/${menuItem._id}`);

      expect(res.status).toBe(401);
    });
  });
});

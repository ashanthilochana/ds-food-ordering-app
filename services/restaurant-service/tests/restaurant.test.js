const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/user.model');
const Restaurant = require('../src/models/restaurant.model');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

describe('Restaurant Endpoints', () => {
  let authToken;
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
          role: testUser.role
        }
      });
  });

  describe('POST /api/restaurants', () => {
    it('should create a new restaurant', async () => {
      const res = await request(app)
        .post('/api/restaurants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testRestaurant);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('name', testRestaurant.name);
      expect(res.body).toHaveProperty('owner', user._id.toString());
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/restaurants')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Restaurant'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/restaurants', () => {
    beforeEach(async () => {
      testRestaurant.owner = user._id;
      await Restaurant.create(testRestaurant);
    });

    it('should get all restaurants', async () => {
      const res = await request(app)
        .get('/api/restaurants');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBe(1);
      expect(res.body[0]).toHaveProperty('name', testRestaurant.name);
    });

    it('should filter by cuisine', async () => {
      const res = await request(app)
        .get('/api/restaurants')
        .query({ cuisine: 'italian' });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body[0].cuisine).toContain('italian');
    });
  });

  describe('GET /api/restaurants/:id', () => {
    let restaurant;

    beforeEach(async () => {
      testRestaurant.owner = user._id;
      restaurant = await Restaurant.create(testRestaurant);
    });

    it('should get restaurant by id', async () => {
      const res = await request(app)
        .get(`/api/restaurants/${restaurant._id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', testRestaurant.name);
    });

    it('should return 404 for non-existent restaurant', async () => {
      const res = await request(app)
        .get('/api/restaurants/123456789012345678901234');

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/restaurants/:id', () => {
    let restaurant;

    beforeEach(async () => {
      testRestaurant.owner = user._id;
      restaurant = await Restaurant.create(testRestaurant);
    });

    it('should update restaurant', async () => {
      const res = await request(app)
        .put(`/api/restaurants/${restaurant._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Restaurant',
          description: 'Updated Description'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', 'Updated Restaurant');
      expect(res.body).toHaveProperty('description', 'Updated Description');
    });

    it('should not update restaurant without authentication', async () => {
      const res = await request(app)
        .put(`/api/restaurants/${restaurant._id}`)
        .send({
          name: 'Updated Restaurant'
        });

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/restaurants/:id', () => {
    let restaurant;

    beforeEach(async () => {
      testRestaurant.owner = user._id;
      restaurant = await Restaurant.create(testRestaurant);
    });

    it('should delete restaurant', async () => {
      const res = await request(app)
        .delete(`/api/restaurants/${restaurant._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Restaurant deleted successfully');

      const deletedRestaurant = await Restaurant.findById(restaurant._id);
      expect(deletedRestaurant).toBeNull();
    });

    it('should not delete restaurant without authentication', async () => {
      const res = await request(app)
        .delete(`/api/restaurants/${restaurant._id}`);

      expect(res.status).toBe(401);
    });
  });
});

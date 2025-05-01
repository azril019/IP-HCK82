const request = require('supertest');
const app = require('../app');
const { User, Preference } = require('../models');
const { signToken } = require('../helpers/jwt');

let token;
let userId;
let preferenceId;

beforeAll(async () => {
  // Create a test user
  const user = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  });
  
  userId = user.id;
  token = signToken({ id: userId, email: user.email });
});

afterAll(async () => {
  // Clean up
  await Preference.destroy({ where: {} });
  await User.destroy({ where: {} });
});

describe('Preference Endpoints', () => {
  
  describe('POST /preference', () => {
    it('should create a new preference', async () => {
      const preference = {
        location: 'Jakarta',
        job: 'Software Engineer',
        degree: 'Bachelor',
        skill: 'JavaScript, Node.js'
      };

      const response = await request(app)
        .post('/preference')
        .set('Authorization', `Bearer ${token}`)
        .send(preference);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.userId).toBe(userId);
      expect(response.body.location).toBe(preference.location);
      expect(response.body.job).toBe(preference.job);
      expect(response.body.degree).toBe(preference.degree);
      expect(response.body.skill).toBe(preference.skill);

      // Save preference ID for later tests
      preferenceId = response.body.id;
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/preference')
        .set('Authorization', `Bearer ${token}`)
        .send({ location: 'Jakarta' }); // Missing other required fields

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 if token is invalid', async () => {
      const response = await request(app)
        .post('/preference')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          location: 'Jakarta',
          job: 'Software Engineer',
          degree: 'Bachelor',
          skill: 'JavaScript, Node.js'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /preference', () => {
    it('should get all preferences for current user', async () => {
      const response = await request(app)
        .get('/preference')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('userId', userId);
    });

    it('should return 401 if token is missing', async () => {
      const response = await request(app)
        .get('/preference');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /preference/:id', () => {
    it('should update a preference', async () => {
      const updates = {
        location: 'Bandung',
        job: 'Full Stack Developer',
        degree: 'Master',
        skill: 'JavaScript, React, Node.js'
      };

      const response = await request(app)
        .put(`/preference/${preferenceId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', preferenceId);
      expect(response.body.location).toBe(updates.location);
      expect(response.body.job).toBe(updates.job);
      expect(response.body.degree).toBe(updates.degree);
      expect(response.body.skill).toBe(updates.skill);
    });

    it('should return 404 if preference not found', async () => {
      const response = await request(app)
        .put('/preference/99999')
        .set('Authorization', `Bearer ${token}`)
        .send({
          location: 'Bandung',
          job: 'Full Stack Developer',
          degree: 'Master',
          skill: 'JavaScript, React, Node.js'
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /preference/:id', () => {
    it('should delete a preference', async () => {
      const response = await request(app)
        .delete(`/preference/${preferenceId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Preference deleted');
      
      // Verify it's actually deleted
      const checkResponse = await request(app)
        .get('/preference')
        .set('Authorization', `Bearer ${token}`);
        
      const deletedPreference = checkResponse.body.find(p => p.id === preferenceId);
      expect(deletedPreference).toBeUndefined();
    });

    it('should return 404 if preference not found', async () => {
      const response = await request(app)
        .delete(`/preference/${preferenceId}`) // Already deleted
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });
});
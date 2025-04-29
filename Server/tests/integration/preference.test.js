const request = require('supertest');
const app = require('../../app');
const { User, Preference } = require('../../models');
const { hashPassword } = require('../../helpers/bcrypt');
const { signToken } = require('../../helpers/jwt');

describe('Preference Controller', () => {
  let testUser, testToken, testPreference;
  
  beforeAll(async () => {
    // Create test user
    testUser = await User.create({
      name: 'Preference Test User',
      email: 'preference@test.com',
      password: hashPassword('password123'),
      provider: 'local'
    });
    
    testToken = signToken({ id: testUser.id });
    
    // Create test preference
    testPreference = await Preference.create({
      user_id: testUser.id,
      location: 'Test City',
      job: 'Test Job',
      degree: 'Test Degree',
      skill: 'Test Skill'
    });
  });
  
  afterAll(async () => {
    await Preference.destroy({ where: { user_id: testUser.id } });
    await User.destroy({ where: { id: testUser.id } });
  });
  
  describe('Get Preferences', () => {
    it('should get user preferences', async () => {
      const response = await request(app)
        .get('/preference')
        .set('Authorization', `Bearer ${testToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.some(pref => pref.id === testPreference.id)).toBe(true);
    });
    
    it('should require authentication', async () => {
      const response = await request(app).get('/preference');
      expect(response.status).toBe(401);
    });
  });
  
  describe('Add Preference', () => {
    it('should add new preference', async () => {
      const newPref = {
        location: 'New City',
        job: 'New Job',
        degree: 'New Degree',
        skill: 'New Skill'
      };
      
      const response = await request(app)
        .post('/preference')
        .set('Authorization', `Bearer ${testToken}`)
        .send(newPref);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('user_id', testUser.id);
      expect(response.body).toHaveProperty('location', newPref.location);
      
      // Clean up this new preference
      await Preference.destroy({ where: { id: response.body.id } });
    });
    
    it('should validate input fields', async () => {
      const response = await request(app)
        .post('/preference')
        .set('Authorization', `Bearer ${testToken}`)
        .send({});
      
      expect(response.status).toBe(400);
    });
  });
  
  describe('Edit Preference', () => {
    it('should update existing preference', async () => {
      const updates = { location: 'Updated City' };
      
      const response = await request(app)
        .put(`/preference/${testPreference.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(updates);
      
      expect(response.status).toBe(200);
      
      // Verify the update
      const updated = await Preference.findByPk(testPreference.id);
      expect(updated.location).toBe(updates.location);
    });
    
    it('should prevent updating non-existent preference', async () => {
      const response = await request(app)
        .put('/preference/999999')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ location: 'Invalid Update' });
      
      expect(response.status).toBe(404);
    });
    
    it('should prevent accessing others preferences', async () => {
      // Create another user
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@test.com',
        password: hashPassword('password123'),
        provider: 'local'
      });
      
      // Create preference for other user
      const otherPreference = await Preference.create({
        user_id: otherUser.id,
        location: 'Other City',
        job: 'Other Job',
        degree: 'Other Degree',
        skill: 'Other Skill'
      });
      
      // Try to update other user's preference
      const response = await request(app)
        .put(`/preference/${otherPreference.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ location: 'Unauthorized Update' });
      
      expect(response.status).toBe(403);
      
      // Clean up
      await Preference.destroy({ where: { id: otherPreference.id } });
      await User.destroy({ where: { id: otherUser.id } });
    });
  });
  
  describe('Delete Preference', () => {
    it('should delete preference', async () => {
      // Create preference to delete
      const prefToDelete = await Preference.create({
        user_id: testUser.id,
        location: 'Delete City',
        job: 'Delete Job',
        degree: 'Delete Degree',
        skill: 'Delete Skill'
      });
      
      const response = await request(app)
        .delete(`/preference/${prefToDelete.id}`)
        .set('Authorization', `Bearer ${testToken}`);
      
      expect(response.status).toBe(200);
      
      // Verify deletion
      const deleted = await Preference.findByPk(prefToDelete.id);
      expect(deleted).toBeNull();
    });
    
    it('should prevent deleting non-existent preference', async () => {
      const response = await request(app)
        .delete('/preference/999999')
        .set('Authorization', `Bearer ${testToken}`);
      
      expect(response.status).toBe(404);
    });
  });
});

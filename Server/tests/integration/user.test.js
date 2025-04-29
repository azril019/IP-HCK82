const request = require('supertest');
const app = require('../../app');
const { User } = require('../../models');
const { hashPassword } = require('../../helpers/bcrypt');

describe('User Controller', () => {
  let testUser;
  
  beforeAll(async () => {
    await User.destroy({ where: { email: 'integration@test.com' } });
    
    testUser = await User.create({
      name: 'Integration Test User',
      email: 'integration@test.com',
      password: hashPassword('password123'),
      provider: 'local'
    });
  });
  
  afterAll(async () => {
    await User.destroy({ where: { email: 'integration@test.com' } });
  });

  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          name: 'New Test User',
          email: 'newintegration@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('access_token');
      
      // Cleanup
      await User.destroy({ where: { email: 'newintegration@test.com' } });
    });
    
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          name: 'Incomplete User'
        });
      
      expect(response.status).toBe(400);
    });
    
    it('should prevent duplicate email', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          name: 'Duplicate Email',
          email: 'integration@test.com',
          password: 'password123'
        });
      
      expect(response.status).toBe(400);
    });
  });
  
  describe('User Login', () => {
    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: 'integration@test.com',
          password: 'password123'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('access_token');
    });
    
    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: 'integration@test.com',
          password: 'wrongpassword'
        });
      
      expect(response.status).toBe(401);
    });
    
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: 'integration@test.com'
        });
      
      expect(response.status).toBe(400);
    });
    
    it('should handle non-existent user', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123'
        });
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('Google Login', () => {
    it('should reject request without googleToken', async () => {
      const response = await request(app)
        .post('/google-login')
        .send({});
      
      expect(response.status).toBe(400);
    });
    
    // Note: We can't fully test Google login without mocking the Google Auth library
    // This would require more complex setup with mock token generation
  });
  
  describe('Profile Management', () => {
    let token;
    
    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/login')
        .send({
          email: 'integration@test.com',
          password: 'password123'
        });
      token = loginResponse.body.access_token;
    });
    
    it('should get user profile', async () => {
      const response = await request(app)
        .get('/profile')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testUser.id);
      expect(response.body).toHaveProperty('email', testUser.email);
    });
    
    it('should delete user profile', async () => {
      // Create a temporary user for deletion test
      const tempUser = await User.create({
        name: 'Delete Test',
        email: 'delete@test.com',
        password: hashPassword('password123'),
        provider: 'local'
      });
      
      const loginResp = await request(app)
        .post('/login')
        .send({
          email: 'delete@test.com',
          password: 'password123'
        });
      
      const deleteToken = loginResp.body.access_token;
      
      const response = await request(app)
        .delete('/profile')
        .set('Authorization', `Bearer ${deleteToken}`);
      
      expect(response.status).toBe(200);
      
      // Verify deletion
      const deletedUser = await User.findByPk(tempUser.id);
      expect(deletedUser).toBeNull();
    });
  });
});

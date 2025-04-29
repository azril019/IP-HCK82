const request = require('supertest');
const app = require('../../app');
const { User } = require('../../models');
const { hashPassword } = require('../../helpers/bcrypt');
const { signToken } = require('../../helpers/jwt');

describe('Recommendation Controller', () => {
  let testUser, testToken;
  
  beforeAll(async () => {
    testUser = await User.create({
      name: 'Recommendation Test User',
      email: 'recommendation@test.com',
      password: hashPassword('password123'),
      provider: 'local'
    });
    
    testToken = signToken({ id: testUser.id });
  });
  
  afterAll(async () => {
    await User.destroy({ where: { id: testUser.id } });
  });
  
  describe('Get Recommendations', () => {
    it('should get recommendations', async () => {
      const response = await request(app)
        .get('/recommendations')
        .set('Authorization', `Bearer ${testToken}`);
      
      expect(response.status).toBe(200);
    });
    
    it('should require authentication', async () => {
      const response = await request(app).get('/recommendations');
      expect(response.status).toBe(401);
    });
  });
  
  describe('Get External Data', () => {
    it('should get external data for valid ID', async () => {
      const response = await request(app)
        .get('/external-data/1')
        .set('Authorization', `Bearer ${testToken}`);
      
      expect(response.status).toBe(200);
    });
    
    it('should handle invalid ID', async () => {
      const response = await request(app)
        .get('/external-data/invalid')
        .set('Authorization', `Bearer ${testToken}`);
      
      expect(response.status).toBe(400);
    });
    
    it('should require authentication', async () => {
      const response = await request(app).get('/external-data/1');
      expect(response.status).toBe(401);
    });
  });
});

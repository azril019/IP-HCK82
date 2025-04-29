const authentication = require('../../middlewares/authentication');
const { signToken } = require('../../helpers/jwt');
const { User } = require('../../models');
const httpMocks = require('node-mocks-http');

jest.mock('../../models', () => ({
  User: {
    findByPk: jest.fn()
  }
}));

describe('Authentication Middleware', () => {
  let req, res, next;
  const userId = 1;
  const validToken = signToken({ id: userId });
  
  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
    
    // Reset mocks
    User.findByPk.mockReset();
    User.findByPk.mockResolvedValue({ id: userId, email: 'test@example.com' });
  });

  test('should pass with valid token in headers', async () => {
    req.headers = { authorization: `Bearer ${validToken}` };
    
    await authentication(req, res, next);
    
    expect(User.findByPk).toHaveBeenCalledWith(userId);
    expect(req.user).toHaveProperty('id', userId);
    expect(next).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith(expect.any(Error));
  });

  test('should fail without token', async () => {
    await authentication(req, res, next);
    
    expect(User.findByPk).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ 
      name: 'Unauthorized',
      message: expect.any(String)
    }));
  });

  test('should fail with invalid token format', async () => {
    req.headers = { authorization: 'InvalidFormat' };
    
    await authentication(req, res, next);
    
    expect(User.findByPk).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ 
      name: 'Unauthorized',
      message: expect.any(String)
    }));
  });

  test('should fail with invalid token', async () => {
    req.headers = { authorization: 'Bearer invalid.token.here' };
    
    await authentication(req, res, next);
    
    expect(User.findByPk).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  test('should fail if user not found', async () => {
    req.headers = { authorization: `Bearer ${validToken}` };
    User.findByPk.mockResolvedValue(null);
    
    await authentication(req, res, next);
    
    expect(User.findByPk).toHaveBeenCalledWith(userId);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ 
      name: 'Unauthorized',
      message: expect.any(String)
    }));
  });
});

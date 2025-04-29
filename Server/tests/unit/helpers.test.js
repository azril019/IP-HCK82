const { hashPassword, comparePassword } = require('../../helpers/bcrypt');
const { signToken, verifyToken } = require('../../helpers/jwt');

describe('Bcrypt Helper', () => {
  const password = 'testPassword123';
  let hashedPassword;
  
  test('should hash password correctly', () => {
    hashedPassword = hashPassword(password);
    expect(hashedPassword).not.toBe(password);
    expect(hashedPassword).toMatch(/^\$2[aby]\$\d+\$/);
  });
  
  test('should compare password correctly', () => {
    expect(comparePassword(password, hashedPassword)).toBe(true);
    expect(comparePassword('wrongPassword', hashedPassword)).toBe(false);
  });
});

describe('JWT Helper', () => {
  const payload = { id: 1, email: 'test@example.com' };
  let token;
  
  test('should sign token correctly', () => {
    token = signToken(payload);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT format
  });
  
  test('should verify token correctly', () => {
    const decoded = verifyToken(token);
    expect(decoded).toHaveProperty('id', payload.id);
    expect(decoded).toHaveProperty('email', payload.email);
  });
  
  test('should throw error for invalid token', () => {
    expect(() => verifyToken('invalid.token.format')).toThrow();
  });
});

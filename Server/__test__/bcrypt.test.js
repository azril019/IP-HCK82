const { hashPassword, comparePassword } = require('../helpers/bcrypt');

describe('Bcrypt Helpers', () => {
  describe('hashPassword', () => {
    it('should hash a password', () => {
      const plainPassword = 'testpassword123';
      const hashedPassword = hashPassword(plainPassword);
      
      // Hashed password should not equal the original
      expect(hashedPassword).not.toBe(plainPassword);
      
      // Hashed password should be a string
      expect(typeof hashedPassword).toBe('string');
      
      // Hashed password should be longer than the original (due to salt + hash)
      expect(hashedPassword.length).toBeGreaterThan(plainPassword.length);
      
      // Bcrypt hashes start with $2a$, $2b$ or $2y$ followed by the cost (10)
      expect(hashedPassword).toMatch(/^\$2[abxy]\$10\$/);
    });

    it('should create different hashes for the same password', () => {
      const password = 'testpassword123';
      const hash1 = hashPassword(password);
      const hash2 = hashPassword(password);
      
      // Each hash should be unique due to different salts
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password and hash', () => {
      const password = 'testpassword123';
      const hashedPassword = hashPassword(password);
      
      const result = comparePassword(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false for non-matching password and hash', () => {
      const password = 'testpassword123';
      const wrongPassword = 'wrongpassword';
      const hashedPassword = hashPassword(password);
      
      const result = comparePassword(wrongPassword, hashedPassword);
      expect(result).toBe(false);
    });

    it('should handle empty strings', () => {
      const emptyPassword = '';
      const hashedEmptyPassword = hashPassword(emptyPassword);
      
      // Empty password should still be hashable and verifiable
      expect(comparePassword(emptyPassword, hashedEmptyPassword)).toBe(true);
      expect(comparePassword('somepassword', hashedEmptyPassword)).toBe(false);
    });
  });
});
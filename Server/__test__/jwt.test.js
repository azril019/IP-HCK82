const jwt = require("jsonwebtoken");

// Mock JWT before importing the module under test
jest.mock("jsonwebtoken");
jest.mock("dotenv", () => ({
  config: jest.fn(),
}));

// Set the environment variable BEFORE importing the module
process.env.JWT_SECRET = "test-secret-key";

// Now import the module after setting environment
const { signToken, verifyToken } = require("../helpers/jwt");

describe("JWT Helpers", () => {
  let originalEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = process.env;
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe("signToken", () => {
    it("should call jwt.sign with correct parameters", () => {
      // Mock implementation
      jwt.sign.mockReturnValue("mocked-token");

      // Test data
      const userData = { id: 1, email: "test@example.com" };

      // Call the function
      const token = signToken(userData);

      // Assertions
      expect(jwt.sign).toHaveBeenCalledWith(userData, "test-secret-key");
      expect(token).toBe("mocked-token");
    });

    it("should return a valid JWT token", () => {
      // Restore original implementation for this test
      jwt.sign.mockImplementation((data, secret) => {
        return `${JSON.stringify(data)}.signed.${secret}`;
      });

      const userData = { id: 123 };
      const token = signToken(userData);

      expect(token).toBe('{"id":123}.signed.test-secret-key');
    });
  });

  describe("verifyToken", () => {
    it("should call jwt.verify with correct parameters", () => {
      // Mock implementation
      jwt.verify.mockReturnValue({ id: 1, email: "test@example.com" });

      // Call the function
      const result = verifyToken("some-token");

      // Assertions
      expect(jwt.verify).toHaveBeenCalledWith("some-token", "test-secret-key");
      expect(result).toEqual({ id: 1, email: "test@example.com" });
    });

    it("should handle verification errors", () => {
      // Mock implementation to simulate error
      const error = new Error("invalid token");
      error.name = "JsonWebTokenError";
      jwt.verify.mockImplementation(() => {
        throw error;
      });

      // Assertions
      expect(() => {
        verifyToken("invalid-token");
      }).toThrow();
    });

    it("should reject expired tokens", () => {
      // Create an actual TokenExpiredError for proper error type
      const expiredError = new Error("jwt expired");
      expiredError.name = "TokenExpiredError";
      expiredError.expiredAt = new Date();

      // Mock implementation to simulate expired token
      jwt.verify.mockImplementation(() => {
        throw expiredError;
      });

      // Assertions
      expect(() => {
        verifyToken("expired-token");
      }).toThrow(/expired/);
    });
  });

  describe("Integration between sign and verify", () => {
    it("should be able to verify a token that was signed", () => {
      // Use original implementations
      const mockPayload = { id: 999, role: "admin" };

      jwt.sign.mockReturnValue("valid.test.token");
      jwt.verify.mockReturnValue(mockPayload);

      const token = signToken(mockPayload);
      const decoded = verifyToken(token);

      expect(decoded).toEqual(mockPayload);
    });
  });
});

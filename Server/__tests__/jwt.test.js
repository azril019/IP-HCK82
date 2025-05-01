const jwt = require("jsonwebtoken");
const { generateToken, verifyToken } = require("../helpers/jwt");

// Mock jsonwebtoken
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "mock-token"),
  verify: jest.fn(() => ({ id: 1 })),
}));

describe("JWT Helper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateToken", () => {
    it("should generate a token with the provided payload", () => {
      const payload = { id: 1, email: "test@example.com" };
      const token = generateToken(payload);

      expect(jwt.sign).toHaveBeenCalledWith(
        payload,
        expect.any(String),
        expect.objectContaining({ expiresIn: expect.any(String) })
      );
      expect(token).toBe("mock-token");
    });

    it("should handle different payloads", () => {
      const payload = { id: 2, role: "admin" };
      generateToken(payload);

      expect(jwt.sign).toHaveBeenCalledWith(
        payload,
        expect.any(String),
        expect.objectContaining({ expiresIn: expect.any(String) })
      );
    });
  });

  describe("verifyToken", () => {
    it("should verify a token and return the payload", () => {
      const token = "valid-token";
      const payload = verifyToken(token);

      expect(jwt.verify).toHaveBeenCalledWith(token, expect.any(String));
      expect(payload).toEqual({ id: 1 });
    });

    it("should throw an error for invalid tokens", () => {
      jwt.verify.mockImplementationOnce(() => {
        throw new Error("Invalid token");
      });

      expect(() => {
        verifyToken("invalid-token");
      }).toThrow();
    });
  });
});

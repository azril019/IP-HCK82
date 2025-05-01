const jwt = require("jsonwebtoken");
const { createToken, verifyToken } = require("../../helpers/jwt");

// Mock jwt module
jest.mock("jsonwebtoken");

describe("JWT Helper Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createToken", () => {
    test("should call jwt.sign with correct parameters", () => {
      const payload = { id: 1, email: "test@example.com" };
      const mockToken = "mock.jwt.token";

      jwt.sign.mockReturnValue(mockToken);

      const result = createToken(payload);

      expect(jwt.sign).toHaveBeenCalledWith(payload, expect.any(String));
      expect(result).toBe(mockToken);
    });
  });

  describe("verifyToken", () => {
    test("should call jwt.verify with correct parameters", () => {
      const token = "valid.token.string";
      const decodedPayload = { id: 1, email: "test@example.com" };

      jwt.verify.mockReturnValue(decodedPayload);

      const result = verifyToken(token);

      expect(jwt.verify).toHaveBeenCalledWith(token, expect.any(String));
      expect(result).toEqual(decodedPayload);
    });

    test("should handle invalid tokens by returning false", () => {
      const token = "invalid.token";

      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const result = verifyToken(token);

      expect(jwt.verify).toHaveBeenCalledWith(token, expect.any(String));
      expect(result).toBe(false);
    });

    it("should throw an error for invalid token", () => {
      const token = "invalid-token";

      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      expect(() => {
        verifyToken(token);
      }).toThrow();
    });
  });
});

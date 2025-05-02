const express = require('express');
const request = require('supertest');
const authentication = require('../middlewares/authentication');
const { verifyToken } = require('../helpers/jwt');
const { User } = require('../models');

// Mock the dependencies
jest.mock("../helpers/jwt", () => ({
  verifyToken: jest.fn(),
  signToken: jest.fn().mockReturnValue("mocked-token"),
}));

// Mock User model
jest.mock("../models", () => ({
  User: {
    findByPk: jest.fn()
  }
}));

describe("Authentication Middleware", () => {
  let app;
  let token;
  const userId = 1;

  beforeEach(() => {
    // Create a fresh Express app for each test
    app = express();
    app.use(express.json());

    // Add a test route that uses the authentication middleware
    app.use(authentication);
    app.get("/protected", (req, res) => {
      res.status(200).json({
        message: "Protected route accessed",
        user: {
          id: req.user.id,
          email: req.user.email,
        },
      });
    });

    // Add error handler with improved JWT error handling
    app.use((err, _req, res, _next) => {
      // Check for auth-related errors to return 401
      const authErrorNames = [
        "Unauthorized", 
        "JsonWebTokenError", 
        "TokenExpiredError"
      ];
      
      const statusCode = authErrorNames.includes(err.name) ? 401 : 500;
      
      res.status(statusCode).json({
        message: err.message || "Internal Server Error",
      });
    });

    // Clear all mocks between tests
    jest.clearAllMocks();

    // Set token directly without relying on actual signToken implementation
    token = "mocked-token";
  });

  it("should allow access with valid token and existing user", async () => {
    // Mock successful token verification
    verifyToken.mockReturnValue({ id: 1, email: "test@example.com" });

    // Mock successful user lookup
    const mockUser = {
      id: 1,
      email: "test@example.com",
      name: "Test User",
    };
    User.findByPk.mockResolvedValue(mockUser);

    const response = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Protected route accessed");
    expect(response.body.user.id).toBe(1);
    expect(verifyToken).toHaveBeenCalledWith("valid-token");
    expect(User.findByPk).toHaveBeenCalledWith(1);
  });

  it("should reject requests with missing authorization header", async () => {
    const response = await request(app).get("/protected");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid token");
    expect(verifyToken).not.toHaveBeenCalled();
    expect(User.findByPk).not.toHaveBeenCalled();
  });

  it("should reject requests with malformed authorization header", async () => {
    const response = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer ");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid token");
    expect(verifyToken).not.toHaveBeenCalled();
    expect(User.findByPk).not.toHaveBeenCalled();
  });

  it("should reject requests with non-bearer authorization header", async () => {
    const response = await request(app)
      .get("/protected")
      .set("Authorization", "Basic dXNlcjpwYXNz");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid token");
    expect(verifyToken).not.toHaveBeenCalled();
    expect(User.findByPk).not.toHaveBeenCalled();
  });

  it("should reject when user does not exist", async () => {
    // Mock successful token verification
    verifyToken.mockReturnValue({
      id: 999,
      email: "nonexistent@example.com",
    });

    // Mock user not found
    User.findByPk.mockResolvedValue(null);

    const response = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid token");
    expect(verifyToken).toHaveBeenCalledWith("valid-token");
    expect(User.findByPk).toHaveBeenCalledWith(999);
  });

  it("should reject when token verification fails", async () => {
    // Mock failed token verification
    const error = new Error("Invalid token");
    error.name = "JsonWebTokenError";
    verifyToken.mockImplementation(() => {
      throw error;
    });

    const response = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid token");
    expect(verifyToken).toHaveBeenCalledWith("invalid-token");
    expect(User.findByPk).not.toHaveBeenCalled();
  });

  it("should handle expired JWT token", async () => {
    // Mock token expiration error
    const error = new Error("jwt expired");
    error.name = "TokenExpiredError";
    verifyToken.mockImplementation(() => {
      throw error;
    });

    const response = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer expired-token");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("jwt expired");
    expect(verifyToken).toHaveBeenCalledWith("expired-token");
    expect(User.findByPk).not.toHaveBeenCalled();
  });

  it("should handle database errors when finding user", async () => {
    // Mock successful token verification
    verifyToken.mockReturnValue({ id: 1, email: "test@example.com" });

    // Mock database error
    const dbError = new Error("Database connection error");
    User.findByPk.mockRejectedValue(dbError);

    const response = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(500);
    expect(verifyToken).toHaveBeenCalledWith("valid-token");
    expect(User.findByPk).toHaveBeenCalledWith(1);
  });

  it("should properly extract user data from token payload", async () => {
    // Mock token with additional data
    const userData = {
      id: 1,
      email: "test@example.com",
      role: "admin",
      createdAt: "2023-01-01",
    };
    verifyToken.mockReturnValue(userData);

    // Mock successful user lookup
    const mockUser = {
      id: 1,
      email: "test@example.com",
      name: "Test User",
      role: "admin",
    };
    User.findByPk.mockResolvedValue(mockUser);

    const response = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(200);
    expect(response.body.user.id).toBe(1);
    expect(verifyToken).toHaveBeenCalledWith("valid-token");
  });

  it("should handle malformed JWT token", async () => {
    // Mock malformed token error
    const error = new Error("jwt malformed");
    error.name = "JsonWebTokenError";
    verifyToken.mockImplementation(() => {
      throw error;
    });

    const response = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer malformed.jwt.token");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("jwt malformed");
  });
});

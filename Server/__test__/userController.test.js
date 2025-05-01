const request = require("supertest");
const express = require("express");
const UserController = require("../Controllers/UserController");
const { User } = require("../models");
const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");

// Mock dependencies
jest.mock("../models", () => ({
  User: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock("../helpers/bcrypt", () => ({
  comparePassword: jest.fn(),
}));

jest.mock("../helpers/jwt", () => ({
  signToken: jest.fn(),
}));

// Create test app
const app = express();
app.use(express.json());
app.post("/register", UserController.register);
app.post("/login", UserController.login);

// Add error handler for testing
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

describe("UserController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        name: "Test User",
        password: "hashedpassword123",
      };

      User.create.mockResolvedValue(mockUser);

      const response = await request(app).post("/register").send({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        id: 1,
        email: "test@example.com",
        name: "Test User",
      });
      expect(User.create).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });
    });

    it("should handle validation errors during registration", async () => {
      const validationError = new Error("Email is required");
      validationError.name = "SequelizeValidationError";
      validationError.errors = [{ message: "Email is required" }];

      User.create.mockRejectedValue(validationError);

      const response = await request(app).post("/register").send({
        password: "password123",
        name: "Test User",
      });

      expect(response.status).toBe(500);
    });
  });

  describe("login", () => {
    it("should login successfully with valid credentials", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        password: "hashedpassword123",
      };

      User.findOne.mockResolvedValue(mockUser);
      comparePassword.mockReturnValue(true);
      signToken.mockReturnValue("fake.jwt.token");

      const response = await request(app).post("/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        access_token: "fake.jwt.token",
      });
      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
      expect(comparePassword).toHaveBeenCalledWith(
        "password123",
        "hashedpassword123"
      );
      expect(signToken).toHaveBeenCalledWith({
        id: 1,
        email: "test@example.com",
      });
    });

    it("should return 400 when email is missing", async () => {
      const response = await request(app).post("/login").send({
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Email and password are required",
      });
    });

    it("should return 400 when password is missing", async () => {
      const response = await request(app).post("/login").send({
        email: "test@example.com",
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Email and password are required",
      });
    });

    it("should return 400 when user is not found", async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app).post("/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Invalid email or password",
      });
    });

    it("should return 400 when password is incorrect", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        password: "hashedpassword123",
      };

      User.findOne.mockResolvedValue(mockUser);
      comparePassword.mockReturnValue(false);

      const response = await request(app).post("/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Invalid email or password",
      });
    });

    it("should pass unexpected errors to the error handler middleware", async () => {
      // Mock User.findOne to throw an unexpected error
      const unexpectedError = new Error("Database connection error");
      User.findOne.mockRejectedValue(unexpectedError);

      const response = await request(app).post("/login").send({
        email: "test@example.com",
        password: "password123",
      });

      // Since our test app has a basic error handler that returns 500
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: "Database connection error",
      });
    });
  });
});

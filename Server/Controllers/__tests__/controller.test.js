const controller = require("../controller");
const { User, Preference } = require("../../models");
const { generateToken } = require("../../helpers/jwt");
const { comparePassword } = require("../../helpers/bcrypt");

// Mock the models and helpers
jest.mock("../../models", () => ({
  User: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  Preference: {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock("../../helpers/jwt", () => ({
  generateToken: jest.fn(),
}));

jest.mock("../../helpers/bcrypt", () => ({
  comparePassword: jest.fn(),
}));

describe("Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: { id: 1 },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      req.body = {
        email: "test@example.com",
        password: "password123",
        username: "testuser",
        phoneNumber: "1234567890",
        address: "Test Address",
      };

      User.create.mockResolvedValue({
        id: 1,
        email: "test@example.com",
        username: "testuser",
      });

      await controller.register(req, res, next);

      expect(User.create).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        username: "testuser",
        phoneNumber: "1234567890",
        address: "Test Address",
        role: "User",
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "User created successfully",
      });
    });

    it("should call next with error if registration fails", async () => {
      req.body = {
        email: "test@example.com",
        password: "password123",
      };

      const error = new Error("Registration failed");
      User.create.mockRejectedValue(error);

      await controller.register(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("login", () => {
    it("should login user successfully", async () => {
      req.body = {
        email: "test@example.com",
        password: "password123",
      };

      User.findOne.mockResolvedValue({
        id: 1,
        email: "test@example.com",
        password: "hashedpassword",
        username: "testuser",
        role: "User",
      });

      comparePassword.mockReturnValue(true);
      generateToken.mockReturnValue("token123");

      await controller.login(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });

      expect(comparePassword).toHaveBeenCalledWith(
        "password123",
        "hashedpassword"
      );
      expect(generateToken).toHaveBeenCalledWith({
        id: 1,
        email: "test@example.com",
        username: "testuser",
        role: "User",
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        access_token: "token123",
        user: {
          id: 1,
          email: "test@example.com",
          username: "testuser",
          role: "User",
        },
      });
    });

    it("should return error for invalid credentials", async () => {
      req.body = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      User.findOne.mockResolvedValue({
        id: 1,
        email: "test@example.com",
        password: "hashedpassword",
      });

      comparePassword.mockReturnValue(false);

      await controller.login(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // Add more test cases for other controller methods
  // The pattern is similar - mock the dependencies, set up the request,
  // invoke the method, and check that the right functions are called
});

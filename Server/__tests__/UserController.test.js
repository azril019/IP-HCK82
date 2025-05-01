const { User } = require("../models");
const { register, login } = require("../Controllers/UserController");
const { hashPassword, comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");

jest.mock("../models");
jest.mock("../helpers/bcrypt");
jest.mock("../helpers/jwt");

describe("UserController", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {
        email: "test@example.com",
        password: "password123",
        username: "testuser",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe("register", () => {
    test("should handle validation errors", async () => {
      req.body = { email: "test@example.com" }; // Missing password

      await register(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test("should handle existing email errors", async () => {
      User.findOne.mockResolvedValue({ email: "test@example.com" });

      await register(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test("should successfully register new user", async () => {
      User.findOne.mockResolvedValue(null);
      hashPassword.mockReturnValue("hashedpassword");

      const mockCreatedUser = {
        id: 1,
        email: "test@example.com",
        username: "testuser",
      };

      User.create.mockResolvedValue(mockCreatedUser);

      await register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
        })
      );
    });
  });

  describe("login", () => {
    test("should handle invalid credentials", async () => {
      User.findOne.mockResolvedValue(null);

      await login(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test("should handle incorrect password", async () => {
      User.findOne.mockResolvedValue({
        email: "test@example.com",
        password: "hashedpassword",
      });

      comparePassword.mockReturnValue(false);

      await login(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test("should successfully login user", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        password: "hashedpassword",
        username: "testuser",
      };

      User.findOne.mockResolvedValue(mockUser);
      comparePassword.mockReturnValue(true);
      signToken.mockReturnValue("fake-jwt-token");

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          access_token: "fake-jwt-token",
        })
      );
    });
  });
});

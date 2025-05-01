const { default: axios } = require("axios");
const controller = require("../../Controllers/controller");
const { User, Preference } = require("../../models");
const { createToken } = require("../../helpers/jwt");

// Mock dependencies
jest.mock("axios");
jest.mock("../../models");
jest.mock("../../helpers/jwt");

describe("Controller Unit Tests", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      headers: {},
      user: { id: 1 },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      req.body = {
        email: "test@example.com",
        password: "password123",
        username: "testuser",
      };

      User.create.mockResolvedValue({ id: 1, ...req.body });

      await controller.register(req, res, next);

      expect(User.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
        })
      );
    });

    it("should handle registration errors", async () => {
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

  describe("getItemRecommendation", () => {
    it("should return recommendations", async () => {
      // Mock axios response
      axios.get.mockResolvedValue({
        data: { recommendations: [{ id: 1, title: "Test Article" }] },
      });

      await controller.getItemRecommendation(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it("should handle errors in fetching recommendations", async () => {
      // Mock axios to throw an error
      axios.get.mockRejectedValue(new Error("API Error"));

      await controller.getItemRecommendation(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  // Add more test cases for other controller methods
  describe("login", () => {
    it("should login a user successfully", async () => {
      // Test implementation
    });
  });

  // Continue with other controller methods...
});

// Separate integration tests that use supertest
describe("Controller API Integration Tests", () => {
  const request = require("supertest");
  const app = require("../../app");

  // Mocking auth middleware for integration tests
  jest.mock("../../middlewares/authentication", () => ({
    authentication: (req, res, next) => {
      req.user = { id: 1 };
      next();
    },
  }));

  describe("POST /register", () => {
    it("should create a new user successfully", async () => {
      // Set up mock for User.create to return success
      User.create.mockResolvedValueOnce({
        id: 1,
        username: "newuser",
        email: "newuser@example.com",
      });

      const res = await request(app).post("/register").send({
        username: "newuser",
        email: "newuser@example.com",
        password: "password123",
        gender: "female",
      });

      expect(res.statusCode).toBe(201);
    });

    test("should return 400 if required fields are missing", async () => {
      const res = await request(app).post("/register").send({
        username: "incomplete",
      });

      expect(res.statusCode).toBe(400);
    });
  });

  // Test login function
  describe("POST /login", () => {
    test("should login successfully with valid credentials", async () => {
      const res = await request(app).post("/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("access_token");
      expect(res.body).toHaveProperty("user");
    });

    test("should return 401 with invalid credentials", async () => {
      const res = await request(app).post("/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(res.statusCode).toBe(401);
    });
  });

  // Add more tests for other controller functions
  // Add tests for preferences, recommendations, etc.

  describe("GET /recommendations", () => {
    it("should return recommendations for authenticated user", async () => {
      const response = await request(app)
        .get("/recommendations")
        .set("access_token", validToken);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return 401 if not authenticated", async () => {
      const response = await request(app).get("/recommendations");

      expect(response.status).toBe(401);
    });
  });

  describe("GET /articles", () => {
    it("should return articles for authenticated user", async () => {
      const response = await request(app)
        .get("/articles")
        .set("access_token", validToken);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("GET /articles/:id", () => {
    it("should return a specific article", async () => {
      // First create an article or use a known ID
      const articleId = 1; // Adjust based on your data

      const response = await request(app)
        .get(`/articles/${articleId}`)
        .set("access_token", validToken);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id");
    });

    it("should return 404 for non-existent article", async () => {
      const response = await request(app)
        .get("/articles/9999")
        .set("access_token", validToken);

      expect(response.status).toBe(404);
    });
  });

  // Add more tests for other endpoints in controller.js
});

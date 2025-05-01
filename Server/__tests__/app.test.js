const request = require("supertest");
const app = require("../app");

// Mock models to prevent actual DB operations
jest.mock("../models", () => {
  const mockSequelize = {
    authenticate: jest.fn().mockResolvedValue(),
  };

  return {
    sequelize: mockSequelize,
    User: {
      findOne: jest.fn().mockResolvedValue(null),
      findByPk: jest.fn().mockResolvedValue(null),
    },
    Preference: {},
  };
});

// Mock controller functions
jest.mock("../Controllers/controller", () => ({
  register: jest.fn((req, res) =>
    res.status(201).json({ message: "User registered" })
  ),
  login: jest.fn((req, res) => res.status(200).json({ access_token: "token" })),
  getProfile: jest.fn((req, res) => res.status(200).json({ user: { id: 1 } })),
  // Add mocks for routes you're testing
}));

// Mock authentication middleware
jest.mock("../middlewares/authentication", () => ({
  authentication: jest.fn((req, res, next) => {
    req.user = { id: 1 };
    next();
  }),
}));

describe("App middleware and configuration", () => {
  it("should respond with 404 for unknown routes", async () => {
    const response = await request(app).get("/non-existent-route");
    expect(response.status).toBe(404);
  });

  it("should use CORS middleware", async () => {
    const response = await request(app).options("/");
    expect(response.headers["access-control-allow-origin"]).toBeDefined();
  });

  // Test a known route with mocked controller
  it("should successfully route to login endpoint", async () => {
    const response = await request(app)
      .post("/login")
      .send({ email: "test@example.com", password: "password123" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("access_token");
  });

  // Test error handling middleware
  it("should handle errors with the error middleware", async () => {
    // Create a test route that throws an error
    const controller = require("../Controllers/controller");

    // Mock a controller function to throw an error
    controller.getProfile.mockImplementationOnce((req, res, next) => {
      next(new Error("Test error"));
    });

    const response = await request(app).get("/profile");

    // Depending on your error handler, status might be different
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("message");
  });
});

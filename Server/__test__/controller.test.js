const request = require("supertest");
const express = require("express");
const { User, Preference } = require("../models");
const axios = require("axios");
const { GoogleGenAI } = require("@google/genai");
const Controller = require("../Controllers/controller");

// Mocks
jest.mock("../models", () => ({
  User: {
    findByPk: jest.fn(),
    destroy: jest.fn(),
  },
  Preference: {
    findAll: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
    destroy: jest.fn(),
  },
}));

jest.mock("axios");
jest.mock("@google/genai");

describe("Controller Endpoints", () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup fresh Express app for each test
    app = express();
    app.use(express.json());

    // Mock authenticated user
    app.use((req, res, next) => {
      req.user = { id: 1, email: "test@example.com" };
      next();
    });

    // Routes for testing
    app.get("/profile", Controller.getProfile);
    app.delete("/profile", Controller.deleteProfile);
    app.post("/preference", Controller.addPreference);
    app.get("/preference", Controller.getPreference);
    app.put("/preference/:id", Controller.editPreference);
    app.delete("/preference/:id", Controller.deletePreference);
    app.get("/external-data/:id", Controller.getExternalData);
    app.get("/recommendations", Controller.getRecommendationFromAi);

    // Error handler
    app.use((err, req, res, next) => {
      res.status(err.statusCode || 500).json({
        message: err.message || "Internal Server Error",
      });
    });
  });

  describe("GET /profile", () => {
    it("should return user profile", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        name: "Test User",
      };
      User.findByPk.mockResolvedValue(mockUser);

      const response = await request(app).get("/profile");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
      expect(User.findByPk).toHaveBeenCalledWith(1, {
        attributes: ["id", "email", "name"],
      });
    });

    it("should return 404 when user is not found", async () => {
      User.findByPk.mockResolvedValue(null);

      const response = await request(app).get("/profile");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "User not found" });
    });

    it("should handle validation errors when getting profile", async () => {
      const error = {
        name: "SequelizeValidationError",
        message: "Validation error",
      };
      User.findByPk.mockRejectedValue(error);

      const response = await request(app).get("/profile");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Validation error");
    });
  });

  describe("DELETE /profile", () => {
    it("should delete user profile", async () => {
      User.destroy.mockResolvedValue(1); // 1 record affected

      const response = await request(app).delete("/profile");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Profile deleted",
        user: 1,
      });
      expect(User.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it("should return 404 when user is not found for deletion", async () => {
      User.destroy.mockResolvedValue(0); // No records affected

      const response = await request(app).delete("/profile");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "User not found" });
    });

    it("should handle validation errors when deleting profile", async () => {
      const error = {
        name: "SequelizeValidationError",
        message: "Validation error",
      };
      User.destroy.mockRejectedValue(error);

      const response = await request(app).delete("/profile");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Validation error");
    });
  });

  describe("GET /preference", () => {
    it("should return user preferences", async () => {
      const mockPreferences = [
        { id: 1, userId: 1, job: "Software Engineer" },
        { id: 2, userId: 1, job: "Frontend Developer" },
      ];
      Preference.findAll.mockResolvedValue(mockPreferences);

      const response = await request(app).get("/preference");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPreferences);
      expect(Preference.findAll).toHaveBeenCalledWith({ where: { userId: 1 } });
    });

    it("should handle validation errors when getting preferences", async () => {
      const error = {
        name: "SequelizeValidationError",
        message: "Validation error",
      };
      Preference.findAll.mockRejectedValue(error);

      const response = await request(app).get("/preference");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Validation error");
    });
  });

  describe("PUT /preference/:id", () => {
    it("should update a preference successfully", async () => {
      const mockPreference = {
        id: 1,
        userId: 1,
        location: "Jakarta",
        job: "Software Engineer",
        update: jest.fn().mockResolvedValue({
          id: 1,
          userId: 1,
          location: "Surabaya",
          job: "Software Engineer",
        }),
      };

      Preference.findByPk.mockResolvedValue(mockPreference);

      const response = await request(app)
        .put("/preference/1")
        .send({ location: "Surabaya" });

      expect(response.status).toBe(200);
      expect(mockPreference.update).toHaveBeenCalledWith({
        location: "Surabaya",
      });
    });

    it("should return 404 when preference is not found for update", async () => {
      Preference.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .put("/preference/999")
        .send({ location: "Surabaya" });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Preference not found" });
    });

    it("should handle validation errors when updating preference", async () => {
      const mockPreference = {
        id: 1,
        userId: 1,
        update: jest.fn().mockRejectedValue({
          name: "SequelizeValidationError",
          message: "Validation error during update",
        }),
      };

      Preference.findByPk.mockResolvedValue(mockPreference);

      const response = await request(app)
        .put("/preference/1")
        .send({ location: "Invalid Location" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("POST /preference", () => {
    it("should create a new preference", async () => {
      const mockPreference = {
        id: 1,
        userId: 1,
        job: "Software Engineer",
        location: "Jakarta",
        degree: "Bachelor",
        skill: "JavaScript",
      };
      Preference.create.mockResolvedValue(mockPreference);

      const response = await request(app).post("/preference").send({
        job: "Software Engineer",
        location: "Jakarta",
        degree: "Bachelor",
        skill: "JavaScript",
      });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockPreference);
      expect(Preference.create).toHaveBeenCalledWith({
        job: "Software Engineer",
        location: "Jakarta",
        degree: "Bachelor",
        skill: "JavaScript",
        userId: 1,
      });
    });

    it("should handle validation errors when creating preference", async () => {
      const error = {
        name: "SequelizeValidationError",
        message: "Validation error",
      };
      Preference.create.mockRejectedValue(error);

      const response = await request(app).post("/preference").send({
        job: "Software Engineer",
        // Missing required fields
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Validation error");
    });
  });

  describe("DELETE /preference/:id", () => {
    it("should delete a preference successfully", async () => {
      Preference.destroy.mockResolvedValue(1); // 1 row affected

      const response = await request(app).delete("/preference/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Preference deleted" });
      expect(Preference.destroy).toHaveBeenCalledWith({ where: { id: "1" } });
    });

    it("should return 404 when preference is not found for deletion", async () => {
      Preference.destroy.mockResolvedValue(0); // 0 rows affected

      const response = await request(app).delete("/preference/999");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Preference not found" });
    });

    it("should handle validation errors when deleting preference", async () => {
      Preference.destroy.mockRejectedValue({
        name: "SequelizeValidationError",
        message: "Validation error during preference deletion",
      });

      const response = await request(app).delete("/preference/1");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("GET /external-data/:id", () => {
    it("should fetch external job data based on user preferences", async () => {
      const mockPreferences = [
        { job: "Software Engineer" },
        { job: "Frontend Developer" },
      ];
      Preference.findAll.mockResolvedValue(mockPreferences);

      const mockJobData = [
        {
          job_title: "Senior Software Engineer",
          company_name: "Google",
          job_link: "https://example.com/job/1",
        },
      ];
      axios.get.mockResolvedValue({ data: mockJobData });

      const response = await request(app).get("/external-data/2"); // page 2

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockJobData);
      expect(Preference.findAll).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("api.scrapingdog.com/linkedinjobs")
      );
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining("page=2"));
    });

    it("should handle empty preferences when fetching external data", async () => {
      Preference.findAll.mockResolvedValue([]);

      const response = await request(app).get("/external-data/1");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "No preferences found");
    });

    it("should handle API errors when fetching external data", async () => {
      const mockPreferences = [{ job: "Software Engineer" }];
      Preference.findAll.mockResolvedValue(mockPreferences);

      // Mock API error
      axios.get.mockRejectedValue(new Error("API Service unavailable"));

      const response = await request(app).get("/external-data/1");

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("GET /recommendations", () => {
    it("should return AI recommendations", async () => {
      // Setup mocks
      const mockPreferences = [{ job: "Software Engineer" }];
      Preference.findAll.mockResolvedValue(mockPreferences);

      axios.get.mockResolvedValue({
        data: [{ job_link: "https://example.com/job/1" }],
      });

      const mockAiInstance = {
        models: {
          generateContent: jest.fn().mockResolvedValue({
            text: 'Some text [{"title":"Software Engineer"}] more text',
          }),
        },
      };
      GoogleGenAI.mockImplementation(() => mockAiInstance);

      const response = await request(app).get("/recommendations");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data[0]).toHaveProperty(
        "title",
        "Software Engineer"
      );
    });

    it("should handle completely unstructured AI responses", async () => {
      const mockPreferences = [{ job: "Software Engineer" }];
      Preference.findAll.mockResolvedValue(mockPreferences);

      axios.get.mockResolvedValue({
        data: [{ job_link: "https://example.com/job/1" }],
      });

      const mockAiInstance = {
        models: {
          generateContent: jest.fn().mockResolvedValue({
            text: "1. This is a completely unstructured response with no JSON or clear formatting",
          }),
        },
      };
      GoogleGenAI.mockImplementation(() => mockAiInstance);

      const unstructuredResponse = await request(app).get("/recommendations");

      expect(unstructuredResponse.status).toBe(200);
      expect(unstructuredResponse.body.success).toBe(true);
      expect(unstructuredResponse.body).toHaveProperty("data");
    });

    it("should handle API errors", async () => {
      Preference.findAll.mockRejectedValue(new Error("Database error"));

      const apiErrorResponse = await request(app).get("/recommendations");

      expect(apiErrorResponse.status).toBe(500);
      expect(apiErrorResponse.body).toHaveProperty("message");
    });
  });
});

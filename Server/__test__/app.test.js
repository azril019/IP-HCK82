const request = require("supertest");
const app = require("../app");
const { User, Preference } = require("../models");
const { signToken } = require("../helpers/jwt");
const { OAuth2Client } = require("google-auth-library");

// Mock Google OAuth
jest.mock("google-auth-library", () => {
  return {
    OAuth2Client: jest.fn().mockImplementation(() => {
      return {
        verifyIdToken: jest.fn().mockResolvedValue({
          getPayload: jest.fn().mockReturnValue({
            email: "google@example.com",
            email_verified: true,
            name: "Google User",
          }),
        }),
      };
    }),
  };
});

let token;
let userId;
let preferenceId;

beforeAll(async () => {
  // Clean up test user if exists
  await User.destroy({ where: { email: "test@example.com" } });
  await User.destroy({ where: { email: "google@example.com" } });
});

afterAll(async () => {
  // Clean up
  await Preference.destroy({ where: {} });
  await User.destroy({ where: { email: "test@example.com" } });
  await User.destroy({ where: { email: "google@example.com" } });
});

describe("App Endpoints", () => {
  describe("GET /", () => {
    it("should return Hello World message", async () => {
      const response = await request(app).get("/");
      expect(response.status).toBe(200);
      expect(response.text).toBe("Hello World!");
    });
  });

  describe("POST /register", () => {
    it("should register a new user", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };

      const response = await request(app).post("/register").send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("email", userData.email);
      expect(response.body).toHaveProperty("name", userData.name);
      expect(response.body).not.toHaveProperty("password");

      userId = response.body.id;
    });

    it("should return 400 if email already exists", async () => {
      const userData = {
        name: "Duplicate User",
        email: "test@example.com",
        password: "password123",
      };

      const response = await request(app).post("/register").send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Email already exists");
    });

    it("should return 400 if required fields are missing", async () => {
      const response = await request(app).post("/register").send({
        name: "Missing Fields User",
        // Missing email and password
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("POST /login", () => {
    it("should login a user and return a token", async () => {
      const loginData = {
        email: "test@example.com",
        password: "password123",
      };

      const response = await request(app).post("/login").send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("access_token");

      // Save token for authenticated tests
      token = response.body.access_token;
    });

    it("should return 400 if email or password is missing", async () => {
      const response = await request(app).post("/login").send({
        email: "test@example.com",
        // Missing password
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Email and password are required"
      );
    });

    it("should return 400 if email is invalid", async () => {
      const response = await request(app).post("/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Invalid email or password"
      );
    });

    it("should return 400 if password is invalid", async () => {
      const response = await request(app).post("/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Invalid email or password"
      );
    });
  });

  describe("POST /google-login", () => {
    // Set timeout for all tests in this describe block
    jest.setTimeout(10000);
    
    it("should login with Google and return token", async () => {
      const response = await request(app)
        .post("/google-login")
        .send({ googleToken: "valid-google-token" });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("access_token");
      expect(response.body).toHaveProperty(
        "message",
        "Success login with google"
      );
    });

    it("should return 400 if Google token is missing", async () => {
      const response = await request(app).post("/google-login").send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Google token is required"
      );
    });

    it("should handle errors in Google authentication", async () => {
      // Create a more effective mock for OAuth2Client
      jest.resetModules();
      jest.doMock("google-auth-library", () => {
        return {
          OAuth2Client: jest.fn().mockImplementation(() => {
            return {
              verifyIdToken: jest.fn().mockRejectedValue(
                new Error("Google API error")
              )
            };
          }),
        };
      });
      
      // Need to re-require the app to use our new mock
      const freshApp = require("../app");
      
      const response = await request(freshApp)
        .post("/google-login")
        .send({ googleToken: "error-token" });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message", "Internal server error");
      
      // Restore the original mock
      jest.dontMock("google-auth-library");
      jest.resetModules();
    });
  });

  // Authenticated routes testing
  describe("GET /profile (authenticated)", () => {
    it("should return user profile for authenticated user", async () => {
      const response = await request(app)
        .get("/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id", userId);
      expect(response.body).toHaveProperty("email", "test@example.com");
      expect(response.body).toHaveProperty("name", "Test User");
      expect(response.body).not.toHaveProperty("password");
    });

    it("should return 401 if token is missing", async () => {
      const response = await request(app).get("/profile");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid token");
    });

    it("should return 401 if token is invalid", async () => {
      const response = await request(app)
        .get("/profile")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid token");
    });
  });

  describe("POST /preference (authenticated)", () => {
    it("should create a new preference", async () => {
      const preferenceData = {
        location: "Jakarta",
        job: "Software Engineer",
        degree: "Bachelor",
        skill: "JavaScript, Node.js",
      };

      const response = await request(app)
        .post("/preference")
        .set("Authorization", `Bearer ${token}`)
        .send(preferenceData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("userId", userId);
      expect(response.body).toHaveProperty("location", preferenceData.location);
      expect(response.body).toHaveProperty("job", preferenceData.job);
      expect(response.body).toHaveProperty("degree", preferenceData.degree);
      expect(response.body).toHaveProperty("skill", preferenceData.skill);

      preferenceId = response.body.id;
    });

    it("should return 400 if required fields are missing", async () => {
      const response = await request(app)
        .post("/preference")
        .set("Authorization", `Bearer ${token}`)
        .send({
          location: "Jakarta",
          // Missing other fields
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("should return 401 if not authenticated", async () => {
      const response = await request(app).post("/preference").send({
        location: "Jakarta",
        job: "Software Engineer",
        degree: "Bachelor",
        skill: "JavaScript",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid token");
    });
  });

  describe("GET /preference (authenticated)", () => {
    it("should get all preferences for the user", async () => {
      const response = await request(app)
        .get("/preference")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty("userId", userId);
    });

    it("should return 401 if not authenticated", async () => {
      const response = await request(app).get("/preference");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid token");
    });
  });

  describe("PUT /preference/:id (authenticated)", () => {
    it("should update a preference", async () => {
      const updates = {
        location: "Bandung",
        job: "Full Stack Developer",
        degree: "Master",
        skill: "JavaScript, React, Node.js",
      };

      const response = await request(app)
        .put(`/preference/${preferenceId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id", preferenceId);
      expect(response.body).toHaveProperty("location", updates.location);
      expect(response.body).toHaveProperty("job", updates.job);
      expect(response.body).toHaveProperty("degree", updates.degree);
      expect(response.body).toHaveProperty("skill", updates.skill);
    });

    it("should return 404 if preference not found", async () => {
      const response = await request(app)
        .put("/preference/99999")
        .set("Authorization", `Bearer ${token}`)
        .send({
          location: "Bandung",
          job: "Full Stack Developer",
          degree: "Master",
          skill: "JavaScript, React, Node.js",
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Preference not found");
    });

    it("should return 401 if not authenticated", async () => {
      const response = await request(app)
        .put(`/preference/${preferenceId}`)
        .send({
          location: "Bandung",
          job: "Developer",
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid token");
    });
  });

  describe("DELETE /preference/:id (authenticated)", () => {
    it("should delete a preference", async () => {
      const response = await request(app)
        .delete(`/preference/${preferenceId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Preference deleted");
    });

    it("should return 404 if preference not found", async () => {
      const response = await request(app)
        .delete(`/preference/${preferenceId}`) // Already deleted
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Preference not found");
    });

    it("should return 401 if not authenticated", async () => {
      const response = await request(app).delete(`/preference/${preferenceId}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid token");
    });
  });

  describe("GET /external-data/:id (authenticated)", () => {
    // Since this uses an external API, we should consider mocking axios
    it("should return 401 if not authenticated", async () => {
      const response = await request(app).get("/external-data/1");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid token");
    });

    // We could add more tests here with proper mocking of axios
  });

  describe("GET /recommendations (authenticated)", () => {
    // Since this uses external services, we should consider mocking
    it("should return 401 if not authenticated", async () => {
      const response = await request(app).get("/recommendations");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid token");
    });

    // We could add more tests here with proper mocking
  });

  describe("DELETE /profile (authenticated)", () => {
    it("should delete the user profile", async () => {
      const response = await request(app)
        .delete("/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Profile deleted");

      // Verify profile is deleted by trying to access a protected endpoint
      const checkResponse = await request(app)
        .get("/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(checkResponse.status).toBe(401);
    });
  });
});

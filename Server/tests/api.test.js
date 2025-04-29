const request = require("supertest");
const app = require("../app");
const { User, Preference } = require("../models");
const { signToken } = require("../helpers/jwt");
const { hashPassword } = require("../helpers/bcrypt");

let testUser;
let testToken;
let testPreference;

beforeAll(async () => {
  // Clean up and create test data
  await User.destroy({ where: { email: "test@example.com" } });

  testUser = await User.create({
    name: "Test User",
    email: "test@example.com",
    password: hashPassword("password123"),
    provider: "local",
  });

  testToken = signToken({ id: testUser.id });

  testPreference = await Preference.create({
    user_id: testUser.id,
    location: "Jakarta",
    job: "Developer",
    degree: "Bachelor",
    skill: "JavaScript",
  });
});

afterAll(async () => {
  // Clean up test data
  await Preference.destroy({ where: { user_id: testUser.id } });
  await User.destroy({ where: { id: testUser.id } });
});

describe("API Endpoints", () => {
  // Public Endpoints
  describe("GET /", () => {
    it("should return Hello World message", async () => {
      const response = await request(app).get("/");
      expect(response.status).toBe(200);
      expect(response.text).toBe("Hello World!");
    });
  });

  describe("Auth Endpoints", () => {
    describe("POST /register", () => {
      it("should register a new user", async () => {
        const newUser = {
          name: "New Test User",
          email: "newtest@example.com",
          password: "password123",
        };

        const response = await request(app).post("/register").send(newUser);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("access_token");

        // Clean up this user
        await User.destroy({ where: { email: newUser.email } });
      });

      it("should return error if email already exists", async () => {
        const response = await request(app).post("/register").send({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        });

        expect(response.status).toBe(400);
      });
    });

    describe("POST /login", () => {
      it("should login with valid credentials", async () => {
        const response = await request(app).post("/login").send({
          email: "test@example.com",
          password: "password123",
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("access_token");
      });

      it("should return error with invalid credentials", async () => {
        const response = await request(app).post("/login").send({
          email: "test@example.com",
          password: "wrongpassword",
        });

        expect(response.status).toBe(401);
      });
    });
  });

  // Protected Endpoints (require authentication)
  describe("Protected Endpoints", () => {
    describe("GET /profile", () => {
      it("should return user profile with valid token", async () => {
        const response = await request(app)
          .get("/profile")
          .set("Authorization", `Bearer ${testToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id", testUser.id);
      });

      it("should return error without token", async () => {
        const response = await request(app).get("/profile");
        expect(response.status).toBe(401);
      });
    });

    describe("Preference Endpoints", () => {
      it("should get all preferences", async () => {
        const response = await request(app)
          .get("/preference")
          .set("Authorization", `Bearer ${testToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
      });

      it("should create a new preference", async () => {
        const newPreference = {
          location: "Bandung",
          job: "Designer",
          degree: "Master",
          skill: "UI/UX",
        };

        const response = await request(app)
          .post("/preference")
          .set("Authorization", `Bearer ${testToken}`)
          .send(newPreference);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("id");

        // Cleanup
        await Preference.destroy({ where: { id: response.body.id } });
      });

      it("should update a preference", async () => {
        const updatedData = { location: "Surabaya" };

        const response = await request(app)
          .put(`/preference/${testPreference.id}`)
          .set("Authorization", `Bearer ${testToken}`)
          .send(updatedData);

        expect(response.status).toBe(200);

        // Verify update
        const updatedPreference = await Preference.findByPk(testPreference.id);
        expect(updatedPreference.location).toBe("Surabaya");
      });

      it("should delete a preference", async () => {
        // Create a preference to delete
        const prefToDelete = await Preference.create({
          user_id: testUser.id,
          location: "Bali",
          job: "Remote Worker",
          degree: "PhD",
          skill: "Research",
        });

        const response = await request(app)
          .delete(`/preference/${prefToDelete.id}`)
          .set("Authorization", `Bearer ${testToken}`);

        expect(response.status).toBe(200);

        // Verify deletion
        const deletedPreference = await Preference.findByPk(prefToDelete.id);
        expect(deletedPreference).toBeNull();
      });
    });

    describe("GET /recommendations", () => {
      it("should return recommendations", async () => {
        const response = await request(app)
          .get("/recommendations")
          .set("Authorization", `Bearer ${testToken}`);

        expect(response.status).toBe(200);
      });
    });

    describe("GET /external-data/:id", () => {
      it("should return external data for a valid ID", async () => {
        const response = await request(app)
          .get("/external-data/1") // Assuming 1 is a valid ID
          .set("Authorization", `Bearer ${testToken}`);

        expect(response.status).toBe(200);
      });
    });
  });
});

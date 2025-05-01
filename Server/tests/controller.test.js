const request = require("supertest");
const app = require("../app");
const { User, Preference } = require("../models");
const { signToken } = require("../helpers/jwt");
const { sequelize } = require("../models");

let token;
let userId;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Create a test user
  const user = await User.create({
    username: "controllertest",
    email: "controller@test.com",
    password: "password123",
  });

  userId = user.id;
  token = signToken({ id: userId });
});

afterAll(async () => {
  await sequelize.close();
});

describe("Controller endpoints", () => {
  // Test fetch users
  test("should fetch all users", async () => {
    const response = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  // Test fetch user by ID
  test("should fetch user by ID", async () => {
    const response = await request(app)
      .get(`/users/${userId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", userId);
  });

  // Test user login
  test("should login a user", async () => {
    const response = await request(app)
      .post("/users/login")
      .send({ email: "controller@test.com", password: "password123" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("access_token");
  });

  // Test user preferences
  test("should create user preferences", async () => {
    const response = await request(app)
      .post("/preferences")
      .set("Authorization", `Bearer ${token}`)
      .send({
        favoriteGenres: ["action", "comedy"],
        favoriteActors: ["Actor One", "Actor Two"],
        favoriteDirectors: ["Director One"],
      });

    expect(response.status).toBe(201);
  });

  test("should fetch user preferences", async () => {
    const response = await request(app)
      .get("/preferences")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
  });

  test("should update user preferences", async () => {
    const response = await request(app)
      .put("/preferences")
      .set("Authorization", `Bearer ${token}`)
      .send({
        favoriteGenres: ["drama", "thriller"],
        favoriteActors: ["Actor Three"],
        favoriteDirectors: ["Director Two"],
      });

    expect(response.status).toBe(200);
  });

  // Test error cases
  test("should handle invalid login", async () => {
    const response = await request(app)
      .post("/users/login")
      .send({ email: "controller@test.com", password: "wrongpassword" });

    expect(response.status).toBe(401);
  });

  test("should handle non-existent user fetch", async () => {
    const response = await request(app)
      .get(`/users/99999`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
  });
});

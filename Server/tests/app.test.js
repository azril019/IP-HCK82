const request = require("supertest");
const app = require("../app");
const { sequelize } = require("../models");

afterAll(async () => {
  await sequelize.close();
});

describe("App Routes", () => {
  test("should respond with 404 for unknown route", async () => {
    const response = await request(app).get("/unknown-route");
    expect(response.status).toBe(404);
  });

  test("should respond from root endpoint", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
  });

  test("should handle OPTIONS requests for CORS", async () => {
    const response = await request(app).options("/");
    expect(response.status).toBe(200);
  });

  test("should have proper security headers", async () => {
    const response = await request(app).get("/");
    expect(response.headers["x-powered-by"]).toBeUndefined();
  });

  test("should parse JSON body", async () => {
    const response = await request(app)
      .post("/users/register")
      .send({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

    // Just checking if the request is processed (even if it may fail for other reasons)
    expect(response.status).not.toBe(500);
  });
});

const setup = require("./setup");
const { sequelize } = require("../models");

// Mock the models
jest.mock("../models", () => {
  return {
    sequelize: {
      sync: jest.fn().mockResolvedValue(),
      close: jest.fn().mockResolvedValue(),
    },
    User: {
      destroy: jest.fn().mockResolvedValue(),
      bulkCreate: jest.fn().mockResolvedValue(),
    },
    Preference: {
      destroy: jest.fn().mockResolvedValue(),
    },
  };
});

describe("Test Setup", () => {
  test("should have beforeAll function", () => {
    expect(typeof setup.beforeAll).toBe("function");
  });

  test("should have afterAll function", () => {
    expect(typeof setup.afterAll).toBe("function");
  });

  test("should call sequelize.sync in beforeAll", async () => {
    await setup.beforeAll();
    expect(sequelize.sync).toHaveBeenCalled();
  });

  test("should call sequelize.close in afterAll", async () => {
    await setup.afterAll();
    expect(sequelize.close).toHaveBeenCalled();
  });

  test("should create test data in beforeAll", async () => {
    const testUsers = [
      {
        username: "testuser1",
        email: "test1@example.com",
        password: "password123",
      },
      {
        username: "testuser2",
        email: "test2@example.com",
        password: "password123",
      },
    ];

    await setup.beforeAll(testUsers);

    expect(sequelize.sync).toHaveBeenCalled();
    expect(sequelize.models.User.destroy).toHaveBeenCalled();
    expect(sequelize.models.User.bulkCreate).toHaveBeenCalledWith(testUsers);
  });
});

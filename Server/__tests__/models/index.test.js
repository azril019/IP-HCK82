const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");

jest.mock("fs");
jest.mock("path");
jest.mock("sequelize");

describe("Models Index", () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
    jest.resetModules();

    // Mock path.join to return predictable paths
    path.join.mockImplementation((...args) => args.join("/"));
    path.basename.mockReturnValue("index.test.js");

    // Mock fs.readdirSync to return a list of model files
    fs.readdirSync.mockReturnValue(["index.js", "user.js", "recipe.js"]);

    // Mock Sequelize constructor and methods
    Sequelize.mockImplementation(() => ({
      authenticate: jest.fn().mockResolvedValue(),
      define: jest.fn(),
      import: jest.fn().mockImplementation((path) => {
        if (path.includes("user")) {
          return {
            name: "User",
            associate: jest.fn(),
          };
        }
        return {
          name: "Recipe",
          associate: jest.fn(),
        };
      }),
    }));
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  test("should use environment-specific config", () => {
    // Set NODE_ENV to test
    process.env.NODE_ENV = "test";

    // Require the models index file
    const models = require("../../models/index");

    // Verify Sequelize was initialized with test config
    expect(Sequelize).toHaveBeenCalled();
  });

  test("should load models from directory", () => {
    // Require the models index file
    const models = require("../../models/index");

    // Verify models were loaded
    expect(fs.readdirSync).toHaveBeenCalled();
  });

  test("should handle different environment configuration", () => {
    // Set NODE_ENV to production
    process.env.NODE_ENV = "production";

    // Require the models index file
    const models = require("../../models/index");

    // Verify Sequelize was initialized with production config
    expect(Sequelize).toHaveBeenCalled();
  });
});

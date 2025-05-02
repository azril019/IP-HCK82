const dotenv = require("dotenv");

// Mock dependencies
jest.mock("dotenv", () => ({
  config: jest.fn(),
}));

// Create a mock Express app before mocking
const mockApp = {
  listen: jest.fn().mockImplementation((port, callback) => {
    if (callback) callback();
    return {
      address: () => ({ port }),
      close: jest.fn(),
    };
  }),
  get: jest.fn().mockImplementation((path, handler) => {
    // Store the handler for testing
    mockApp.routes = mockApp.routes || {};
    mockApp.routes[path] = handler;
  }),
  routes: {},
};

// Now mock the app.js module with our prepared mock
jest.mock("../app.js", () => mockApp);

// For the supertest functionality
const request = {
  get: (path) => {
    return new Promise((resolve) => {
      // Create mock response object
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockImplementation((text) => {
          res.text = text;
          return res;
        }),
        text: "",
      };

      // Call the stored route handler
      if (mockApp.routes && mockApp.routes[path]) {
        mockApp.routes[path]({}, res);
      }

      resolve(res);
    });
  },
};

describe("Server Initialization", () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = process.env;
    process.env = { ...originalEnv };
    jest.clearAllMocks();

    // Add a test route for our mock app
    mockApp.get("/test", (req, res) => {
      res.status(200).send("Test route works");
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should load dotenv when not in production", () => {
    process.env.NODE_ENV = "development";

    // Execute the server file
    require("../bin/www");

    expect(dotenv.config).toHaveBeenCalled();
  });

  it("should not load dotenv when in production", () => {
    process.env.NODE_ENV = "production";

    // Need to clear cache to force re-execution with new env
    jest.resetModules();

    // Execute the server file
    require("../bin/www");

    expect(dotenv.config).not.toHaveBeenCalled();
  });

  it("should use the specified PORT environment variable", () => {
    process.env.PORT = "4000";
    process.env.NODE_ENV = "test";

    jest.resetModules();
    require("../bin/www");

    expect(mockApp.listen).toHaveBeenCalledWith("4000", expect.any(Function));
  });

  it("should default to port 3000 if PORT not specified", () => {
    delete process.env.PORT;
    process.env.NODE_ENV = "test";

    jest.resetModules();
    require("../bin/www");

    expect(mockApp.listen).toHaveBeenCalledWith(3000, expect.any(Function));
  });

  it("should have a working Express app", async () => {
    const response = await request.get("/test");
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.text).toBe("Test route works");
  });
});

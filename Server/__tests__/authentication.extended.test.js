const authentication = require("../middlewares/authentication");
const { verifyToken } = require("../helpers/jwt");
const { User } = require("../models");

// Mock dependencies
jest.mock("../helpers/jwt");
jest.mock("../models");

describe("Authentication Middleware Extended Tests", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("should return 401 if authorization header is missing", async () => {
    req.headers.authorization = undefined;

    await authentication(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if token format is invalid (missing Bearer)", async () => {
    req.headers.authorization = "invalid-format-token";

    await authentication(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if token is malformed", async () => {
    req.headers.authorization = "Bearer ";

    await authentication(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if token verification throws error", async () => {
    req.headers.authorization = "Bearer invalid-token";
    verifyToken.mockImplementation(() => {
      throw new Error("Token verification failed");
    });

    await authentication(req, res, next);

    expect(verifyToken).toHaveBeenCalledWith("invalid-token");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if user is not found in database", async () => {
    req.headers.authorization = "Bearer valid-token";
    verifyToken.mockReturnValue({ id: 999 }); // Non-existent user ID
    User.findByPk.mockResolvedValue(null);

    await authentication(req, res, next);

    expect(verifyToken).toHaveBeenCalledWith("valid-token");
    expect(User.findByPk).toHaveBeenCalledWith(999);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should set req.user and call next() if authentication is successful", async () => {
    req.headers.authorization = "Bearer valid-token";
    const userData = { id: 1, email: "test@example.com", name: "Test User" };
    verifyToken.mockReturnValue({ id: 1 });
    User.findByPk.mockResolvedValue(userData);

    await authentication(req, res, next);

    expect(verifyToken).toHaveBeenCalledWith("valid-token");
    expect(User.findByPk).toHaveBeenCalledWith(1);
    expect(req.user).toEqual(userData);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("should handle database errors during user lookup", async () => {
    req.headers.authorization = "Bearer valid-token";
    verifyToken.mockReturnValue({ id: 1 });

    const dbError = new Error("Database connection error");
    User.findByPk.mockRejectedValue(dbError);

    await authentication(req, res, next);

    expect(verifyToken).toHaveBeenCalledWith("valid-token");
    expect(User.findByPk).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
    expect(next).not.toHaveBeenCalled();
  });
});

const { authentication } = require("../middlewares/authentication");
const { verifyToken } = require("../helpers/jwt");
const { User } = require("../models");

// Mock dependencies
jest.mock("../helpers/jwt", () => ({
  verifyToken: jest.fn(),
}));

jest.mock("../models", () => ({
  User: {
    findByPk: jest.fn(),
  },
}));

describe("Authentication Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("should authenticate with valid token and set user in request", async () => {
    req.headers.authorization = "Bearer valid-token";

    verifyToken.mockReturnValueOnce({ id: 1 });
    User.findByPk.mockResolvedValueOnce({ id: 1, email: "test@example.com" });

    await authentication(req, res, next);

    expect(verifyToken).toHaveBeenCalledWith("valid-token");
    expect(User.findByPk).toHaveBeenCalledWith(1);
    expect(req.user).toEqual({ id: 1, email: "test@example.com" });
    expect(next).toHaveBeenCalled();
  });

  it("should respond with 401 when no token is provided", async () => {
    await authentication(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("token"),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should respond with 401 for malformed authorization header", async () => {
    req.headers.authorization = "invalid-format";

    await authentication(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should respond with 401 for invalid token", async () => {
    req.headers.authorization = "Bearer invalid-token";

    verifyToken.mockImplementationOnce(() => {
      throw new Error("Invalid token");
    });

    await authentication(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should respond with 401 when user not found", async () => {
    req.headers.authorization = "Bearer valid-token";

    verifyToken.mockReturnValueOnce({ id: 999 });
    User.findByPk.mockResolvedValueOnce(null);

    await authentication(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});

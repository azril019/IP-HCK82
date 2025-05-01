const authentication = require("../../middlewares/authentication");
const { verifyToken } = require("../../helpers/jwt");
const { User } = require("../../models");

// Mock dependencies
jest.mock("../../helpers/jwt");
jest.mock("../../models");

describe("Authentication Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("should call next() when valid token is provided", async () => {
    req.headers = { access_token: "valid_token" };
    const mockPayload = { id: 1 };

    verifyToken.mockReturnValue(mockPayload);
    User.findByPk.mockResolvedValue({ id: 1, email: "test@example.com" });

    // Use the correct function name based on your middleware export
    await authentication(req, res, next);

    expect(verifyToken).toHaveBeenCalledWith("valid_token");
    expect(User.findByPk).toHaveBeenCalledWith(1);
    expect(req.user).toEqual({ id: 1, email: "test@example.com" });
    expect(next).toHaveBeenCalled();
  });

  it("should respond with 401 when no token is provided", async () => {
    await authentication(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    expect(next).not.toHaveBeenCalled();
  });

  it("should respond with 401 when token is invalid", async () => {
    req.headers = { access_token: "invalid_token" };

    verifyToken.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    await authentication(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    expect(next).not.toHaveBeenCalled();
  });

  it("should respond with 401 when user is not found", async () => {
    req.headers = { access_token: "valid_token" };

    verifyToken.mockReturnValue({ id: 999 });
    User.findByPk.mockResolvedValue(null);

    await authentication(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    expect(next).not.toHaveBeenCalled();
  });
});

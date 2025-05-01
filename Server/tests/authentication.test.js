const { authentication } = require("../middlewares/authentication");
const { signToken } = require("../helpers/jwt");
const { User } = require("../models");
const { sequelize } = require("../models");

jest.mock("../models", () => {
  const originalModule = jest.requireActual("../models");
  return {
    ...originalModule,
    User: {
      findByPk: jest.fn(),
    },
  };
});

describe("Authentication Middleware", () => {
  let mockRequest;
  let mockResponse;
  let nextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test("should return 401 if no token provided", async () => {
    await authentication(mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Invalid token",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test("should return 401 if token format is invalid", async () => {
    mockRequest.headers.authorization = "InvalidTokenFormat";

    await authentication(mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Invalid token",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test("should return 401 if token is invalid", async () => {
    mockRequest.headers.authorization = "Bearer invalidtoken123";

    await authentication(mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Invalid token",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test("should return 401 if user not found", async () => {
    const token = signToken({ id: 999 });
    mockRequest.headers.authorization = `Bearer ${token}`;

    User.findByPk.mockResolvedValue(null);

    await authentication(mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Invalid token",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test("should set request.user and call next if authentication succeeds", async () => {
    const userId = 1;
    const token = signToken({ id: userId });
    const mockUser = { id: userId, username: "testuser" };

    mockRequest.headers.authorization = `Bearer ${token}`;
    User.findByPk.mockResolvedValue(mockUser);

    await authentication(mockRequest, mockResponse, nextFunction);

    expect(mockRequest.user).toEqual(mockUser);
    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });
});

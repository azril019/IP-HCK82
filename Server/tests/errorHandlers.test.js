const { errorHandler } = require("../Controllers/errorHandlers");

describe("Error Handlers", () => {
  let mockRequest;
  let mockResponse;
  let nextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  test("should handle ValidationError", () => {
    const error = {
      name: "ValidationError",
      errors: [{ message: "Validation failed" }],
    };

    errorHandler(error, mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Validation failed",
    });
  });

  test("should handle SequelizeValidationError", () => {
    const error = {
      name: "SequelizeValidationError",
      errors: [{ message: "Sequelize validation failed" }],
    };

    errorHandler(error, mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Sequelize validation failed",
    });
  });

  test("should handle SequelizeUniqueConstraintError", () => {
    const error = {
      name: "SequelizeUniqueConstraintError",
      errors: [{ message: "Unique constraint failed" }],
    };

    errorHandler(error, mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Unique constraint failed",
    });
  });

  test("should handle custom error with status code", () => {
    const error = {
      status: 403,
      message: "Forbidden",
    };

    errorHandler(error, mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: "Forbidden" });
  });

  test("should handle unknown errors", () => {
    const error = new Error("Unknown error");

    errorHandler(error, mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Internal server error",
    });
  });
});

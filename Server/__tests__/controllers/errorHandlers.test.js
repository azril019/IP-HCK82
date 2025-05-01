const { errorHandler } = require("../../Controllers/errorHandlers");

describe("Error Handlers", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test("should handle SequelizeValidationError correctly", () => {
    const error = {
      name: "SequelizeValidationError",
      errors: [
        { message: "Validation error 1" },
        { message: "Validation error 2" },
      ],
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: ["Validation error 1", "Validation error 2"],
    });
  });

  test("should handle SequelizeUniqueConstraintError correctly", () => {
    const error = {
      name: "SequelizeUniqueConstraintError",
      errors: [{ message: "Unique constraint error" }],
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: ["Unique constraint error"],
    });
  });

  test("should handle custom error with status correctly", () => {
    const error = {
      name: "CustomError",
      status: 403,
      message: "Custom error message",
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Custom error message",
    });
  });

  test("should default to 500 status for unknown errors", () => {
    const error = {
      name: "UnknownError",
      message: "Something unexpected happened",
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });

  it('should handle "Not Found" errors with 404 status', () => {
    const error = {
      name: "Error",
      message: "Not Found",
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Not Found" });
  });

  it('should handle "Invalid token" errors with 401 status', () => {
    const error = {
      name: "JsonWebTokenError",
      message: "Invalid token",
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
  });

  it("should handle generic errors with 500 status", () => {
    const error = {
      name: "Error",
      message: "Something went wrong",
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Something went wrong" });
  });
});

const errorHandlers = require("../Controllers/errorHandlers");

describe("Error Handlers", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("should handle SequelizeValidationError with 400 status", () => {
    const error = {
      name: "SequelizeValidationError",
      errors: [
        { message: "First validation error" },
        { message: "Second validation error" },
      ],
    };

    errorHandlers(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: ["First validation error", "Second validation error"],
    });
  });

  it("should handle SequelizeUniqueConstraintError with 400 status", () => {
    const error = {
      name: "SequelizeUniqueConstraintError",
      errors: [{ message: "Email must be unique" }],
    };

    errorHandlers(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: ["Email must be unique"],
    });
  });

  it("should handle custom errors with provided status", () => {
    const error = {
      status: 403,
      message: "Forbidden access",
    };

    errorHandlers(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Forbidden access",
    });
  });

  it('should handle errors with name "BadRequest"', () => {
    const error = {
      name: "BadRequest",
      message: "Invalid input data",
    };

    errorHandlers(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid input data",
    });
  });

  it("should handle JsonWebTokenError with 401 status", () => {
    const error = {
      name: "JsonWebTokenError",
      message: "Invalid token",
    };

    errorHandlers(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid token",
    });
  });

  it("should default to 500 status for unknown errors", () => {
    const error = {
      name: "UnknownError",
      message: "Something went wrong",
    };

    errorHandlers(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server error",
    });
  });
});

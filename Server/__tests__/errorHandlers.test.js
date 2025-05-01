const errorHandlers = require("../Controllers/errorHandlers");

describe("Error Handlers", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe("handleSequelizeValidationError", () => {
    it("should handle SequelizeValidationError with 400 status", () => {
      const error = new Error("Validation error");
      error.name = "SequelizeValidationError";
      error.errors = [
        { message: "Email is required" },
        { message: "Password is required" },
      ];

      errorHandlers.handleSequelizeValidationError(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.arrayContaining([
          "Email is required",
          "Password is required",
        ]),
      });
    });

    it("should call next for non-SequelizeValidationError", () => {
      const error = new Error("Other error");
      error.name = "OtherError";

      errorHandlers.handleSequelizeValidationError(error, req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("handleSequelizeUniqueConstraintError", () => {
    it("should handle SequelizeUniqueConstraintError with 400 status", () => {
      const error = new Error("Unique constraint error");
      error.name = "SequelizeUniqueConstraintError";
      error.errors = [{ message: "Email must be unique" }];

      errorHandlers.handleSequelizeUniqueConstraintError(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.arrayContaining(["Email must be unique"]),
      });
    });

    it("should call next for non-SequelizeUniqueConstraintError", () => {
      const error = new Error("Other error");
      error.name = "OtherError";

      errorHandlers.handleSequelizeUniqueConstraintError(error, req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("handleCustomError", () => {
    it("should handle custom error with provided status", () => {
      const error = new Error("Not found");
      error.name = "NotFound";
      error.status = 404;

      errorHandlers.handleCustomError(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Not found",
      });
    });

    it("should call next for non-custom errors", () => {
      const error = new Error("Server error");

      errorHandlers.handleCustomError(error, req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("handleServerError", () => {
    it("should handle server errors with 500 status", () => {
      const error = new Error("Internal server error");

      errorHandlers.handleServerError(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });
});

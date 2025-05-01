const errorHandlers = require("../../Controllers/errorHandlers");

describe("Error Handlers", () => {
  let res, next;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should handle validation errors", () => {
    const err = {
      name: "SequelizeValidationError",
      errors: [
        { message: "Username is required" },
        { message: "Email is required" },
      ],
    };

    errorHandlers(err, {}, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: expect.arrayContaining([
        "Username is required",
        "Email is required",
      ]),
    });
  });

  it("should handle unique constraint errors", () => {
    const err = {
      name: "SequelizeUniqueConstraintError",
      errors: [{ message: "Email already exists" }],
    };

    errorHandlers(err, {}, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: expect.arrayContaining(["Email already exists"]),
    });
  });

  it("should handle 401 errors", () => {
    const err = { code: 401, message: "Unauthorized" };

    errorHandlers(err, {}, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("should handle 404 errors", () => {
    const err = { code: 404, message: "Not Found" };

    errorHandlers(err, {}, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Not Found" });
  });

  it("should handle default errors", () => {
    const err = new Error("Something went wrong");

    errorHandlers(err, {}, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
  });
});

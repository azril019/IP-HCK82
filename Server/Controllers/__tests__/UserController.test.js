const UserController = require("../UserController");
const { User } = require("../../models");

jest.mock("../../models", () => ({
  User: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
  },
}));

describe("UserController", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      user: { id: 1 },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    jest.clearAllMocks();
  });

  describe("fetchAllUsers", () => {
    it("should fetch all users successfully", async () => {
      const mockUsers = [
        { id: 1, username: "user1", email: "user1@example.com" },
        { id: 2, username: "user2", email: "user2@example.com" },
      ];

      User.findAll.mockResolvedValue(mockUsers);

      await UserController.fetchAllUsers(req, res, next);

      expect(User.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    it("should handle errors properly", async () => {
      const error = new Error("Database error");
      User.findAll.mockRejectedValue(error);

      await UserController.fetchAllUsers(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("updateUserById", () => {
    it("should update user successfully", async () => {
      req.params.id = "1";
      req.body = {
        username: "updatedUser",
        email: "updated@example.com",
      };

      const mockUser = {
        id: 1,
        username: "oldUsername",
        email: "old@example.com",
        save: jest.fn().mockResolvedValue(true),
      };

      User.findByPk.mockResolvedValue(mockUser);
      User.update.mockResolvedValue([1]);

      await UserController.updateUserById(req, res, next);

      expect(User.update).toHaveBeenCalledWith(req.body, {
        where: { id: "1" },
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});

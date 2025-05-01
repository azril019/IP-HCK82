const controller = require("../Controllers/controller");
const {
  User,
  Recipe,
  Category,
  Ingredient,
  Step,
  UserRecipe,
} = require("../models");

jest.mock("../models");

describe("Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: { id: 1 },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe("getAllRecipes", () => {
    test("should handle recipe retrieval", async () => {
      Recipe.findAll.mockResolvedValue([
        { id: 1, title: "Test Recipe", userId: 1, Ingredients: [], Steps: [] },
      ]);

      await controller.getAllRecipes(req, res, next);

      expect(Recipe.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    test("should handle errors", async () => {
      Recipe.findAll.mockRejectedValue(new Error("Database error"));

      await controller.getAllRecipes(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("getRecipeById", () => {
    test("should handle recipe not found", async () => {
      Recipe.findByPk.mockResolvedValue(null);
      req.params.id = "999";

      await controller.getRecipeById(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test("should return a recipe by id", async () => {
      Recipe.findByPk.mockResolvedValue({ id: 1, title: "Test Recipe" });
      req.params.id = "1";

      await controller.getRecipeById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe("createRecipe", () => {
    test("should create a new recipe with ingredients and steps", async () => {
      req.body = {
        title: "New Recipe",
        categoryId: 1,
        ingredients: [{ name: "Ingredient 1" }],
        steps: [{ instruction: "Step 1" }],
      };

      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      sequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };
      Recipe.create.mockResolvedValue({ id: 1, title: "New Recipe" });
      Ingredient.bulkCreate.mockResolvedValue([]);
      Step.bulkCreate.mockResolvedValue([]);

      await controller.createRecipe(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    test("should handle transaction errors", async () => {
      req.body = { title: "New Recipe" };
      Recipe.create.mockRejectedValue(new Error("DB Error"));

      await controller.createRecipe(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("updateRecipe", () => {
    test("should update a recipe", async () => {
      req.params.id = "1";
      req.body = { title: "Updated Recipe" };
      Recipe.findByPk.mockResolvedValue({
        id: 1,
        title: "Old Recipe",
        userId: 1,
        update: jest.fn().mockResolvedValue(true),
      });

      await controller.updateRecipe(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("should handle unauthorized update", async () => {
      req.params.id = "1";
      req.user = { id: 2 };
      Recipe.findByPk.mockResolvedValue({ id: 1, userId: 1 });

      await controller.updateRecipe(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("deleteRecipe", () => {
    test("should delete a recipe", async () => {
      req.params.id = "1";
      Recipe.findByPk.mockResolvedValue({
        id: 1,
        userId: 1,
        destroy: jest.fn().mockResolvedValue(true),
      });

      await controller.deleteRecipe(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("should handle recipe not found", async () => {
      req.params.id = "999";
      Recipe.findByPk.mockResolvedValue(null);

      await controller.deleteRecipe(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("favoriteRecipe", () => {
    test("should add recipe to favorites", async () => {
      req.params.id = "1";
      Recipe.findByPk.mockResolvedValue({ id: 1, title: "Test Recipe" });
      UserRecipe.findOne.mockResolvedValue(null);
      UserRecipe.create.mockResolvedValue({ userId: 1, recipeId: 1 });

      await controller.favoriteRecipe(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    test("should handle already favorited recipe", async () => {
      req.params.id = "1";
      Recipe.findByPk.mockResolvedValue({ id: 1, title: "Test Recipe" });
      UserRecipe.findOne.mockResolvedValue({ userId: 1, recipeId: 1 });

      await controller.favoriteRecipe(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("getUserFavorites", () => {
    test("should get user favorites", async () => {
      UserRecipe.findAll.mockResolvedValue([
        { recipeId: 1, Recipe: { title: "Favorite Recipe" } },
      ]);

      await controller.getUserFavorites(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("should handle errors when getting favorites", async () => {
      UserRecipe.findAll.mockRejectedValue(new Error("DB Error"));

      await controller.getUserFavorites(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("getCategories", () => {
    test("should retrieve all categories", async () => {
      Category.findAll.mockResolvedValue([{ id: 1, name: "Dessert" }]);

      await controller.getCategories(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    test("should handle errors when retrieving categories", async () => {
      Category.findAll.mockRejectedValue(new Error("Database error"));

      await controller.getCategories(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("getCategoryById", () => {
    test("should retrieve a category by id", async () => {
      Category.findByPk.mockResolvedValue({ id: 1, name: "Dessert" });
      req.params.id = "1";

      await controller.getCategoryById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    test("should handle category not found", async () => {
      Category.findByPk.mockResolvedValue(null);
      req.params.id = "999";

      await controller.getCategoryById(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("getRecipesByCategory", () => {
    test("should retrieve recipes by category", async () => {
      const mockCategory = {
        id: 1,
        name: "Dessert",
        Recipes: [{ id: 1, title: "Chocolate Cake" }],
      };
      Category.findByPk.mockResolvedValue(mockCategory);
      req.params.id = "1";

      await controller.getRecipesByCategory(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    test("should handle category not found", async () => {
      Category.findByPk.mockResolvedValue(null);
      req.params.id = "999";

      await controller.getRecipesByCategory(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("removeFavorite", () => {
    test("should remove recipe from favorites", async () => {
      req.params.id = "1";
      const mockFavorite = {
        destroy: jest.fn().mockResolvedValue(true),
      };
      UserRecipe.findOne.mockResolvedValue(mockFavorite);

      await controller.removeFavorite(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    test("should handle favorite not found", async () => {
      req.params.id = "999";
      UserRecipe.findOne.mockResolvedValue(null);

      await controller.removeFavorite(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("getMyRecipes", () => {
    test("should retrieve user's recipes", async () => {
      Recipe.findAll.mockResolvedValue([
        { id: 1, title: "My Recipe", userId: 1 },
      ]);

      await controller.getMyRecipes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    test("should handle errors when retrieving user's recipes", async () => {
      Recipe.findAll.mockRejectedValue(new Error("Database error"));

      await controller.getMyRecipes(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("searchRecipes", () => {
    test("should search recipes by title", async () => {
      req.query = { q: "chocolate" };
      Recipe.findAll.mockResolvedValue([
        { id: 1, title: "Chocolate Cake", userId: 1 },
      ]);

      await controller.searchRecipes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    test("should handle empty search results", async () => {
      req.query = { q: "nonexistent" };
      Recipe.findAll.mockResolvedValue([]);

      await controller.searchRecipes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    test("should handle errors during search", async () => {
      req.query = { q: "test" };
      Recipe.findAll.mockRejectedValue(new Error("Database error"));

      await controller.searchRecipes(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  // Test register functionality
  describe("register", () => {
    it("should register a new user successfully", async () => {
      req.body = {
        email: "test@example.com",
        password: "password123",
        fullName: "Test User",
      };

      User.create.mockResolvedValue({
        id: 1,
        email: "test@example.com",
        fullName: "Test User",
      });

      await controller.register(req, res, next);

      expect(User.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
        })
      );
    });

    it("should handle registration errors", async () => {
      req.body = {
        email: "test@example.com",
        password: "password123",
      };

      const error = new Error("Registration failed");
      User.create.mockRejectedValue(error);

      await controller.register(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it("should handle validation errors", async () => {
      req.body = {
        email: "test@example.com",
        // Missing password
      };

      const validationError = new Error("Validation error");
      validationError.name = "SequelizeValidationError";
      User.create.mockRejectedValue(validationError);

      await controller.register(req, res, next);

      expect(next).toHaveBeenCalledWith(validationError);
    });
  });

  // Test login functionality
  describe("login", () => {
    it("should login successfully with correct credentials", async () => {
      req.body = {
        email: "test@example.com",
        password: "password123",
      };

      User.findOne.mockResolvedValue({
        id: 1,
        email: "test@example.com",
        password: "hashedPassword",
      });

      await controller.login(req, res, next);

      expect(User.findOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          access_token: expect.any(String),
        })
      );
    });

    it("should handle invalid email", async () => {
      req.body = {
        email: "wrong@example.com",
        password: "password123",
      };

      User.findOne.mockResolvedValue(null);

      await controller.login(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.stringContaining("Invalid"),
        })
      );
    });

    it("should handle invalid password", async () => {
      const { comparePassword } = require("../helpers/bcrypt");
      comparePassword.mockReturnValueOnce(false);

      req.body = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      User.findOne.mockResolvedValue({
        id: 1,
        email: "test@example.com",
        password: "hashedPassword",
      });

      await controller.login(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.stringContaining("Invalid"),
        })
      );
    });
  });
});

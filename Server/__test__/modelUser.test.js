const { User } = require("../models");
const { hashPassword, comparePassword } = require("../helpers/bcrypt");

describe("User Model", () => {
  afterAll(async () => {
    // Clean up test data
    await User.destroy({
      where: {
        email: "modeltest@example.com",
      },
    });
  });

  describe("validations", () => {
    it("should require email", async () => {
      try {
        await User.create({
          name: "Test User",
          password: "password123",
          // Missing email
        });
        // If we reach here, validation failed to throw
        expect(true).toBe(false);
      } catch (error) {
        expect(error.name).toBe("SequelizeValidationError");
        expect(error.message).toContain("Email is required");
      }
    });

    it("should require valid email format", async () => {
      try {
        await User.create({
          name: "Test User",
          email: "notavalidemail",
          password: "password123",
        });
        // If we reach here, validation failed to throw
        expect(true).toBe(false);
      } catch (error) {
        expect(error.name).toBe("SequelizeValidationError");
        expect(error.message).toContain("Invalid email format");
      }
    });

    it("should require password", async () => {
      try {
        await User.create({
          name: "Test User",
          email: "modeltest@example.com",
          // Missing password
        });
        // If we reach here, validation failed to throw
        expect(true).toBe(false);
      } catch (error) {
        expect(error.name).toBe("SequelizeValidationError");
        expect(error.message).toContain("Password is required");
      }
    });

    it("should require name", async () => {
      try {
        await User.create({
          email: "modeltest@example.com",
          password: "password123",
          // Missing name
        });
        // If we reach here, validation failed to throw
        expect(true).toBe(false);
      } catch (error) {
        expect(error.name).toBe("SequelizeValidationError");
        expect(error.message).toContain("Username is required");
      }
    });

    it("should enforce unique email constraint", async () => {
      // First create a user
      await User.create({
        name: "Test User",
        email: "modeltest@example.com",
        password: "password123",
      });

      // Try to create another with the same email
      try {
        await User.create({
          name: "Another User",
          email: "modeltest@example.com",
          password: "password123",
        });
        // If we reach here, validation failed to throw
        expect(true).toBe(false);
      } catch (error) {
        expect(error.name).toBe("SequelizeUniqueConstraintError");
        // Don't test the exact message content
      }
    });
  });

  describe("hooks", () => {
    it("should hash password before creating user", async () => {
      // Create a test user
      const testPassword = "password123";
      const user = await User.create({
        name: "Password Test User",
        email: "passwordtest@example.com",
        password: testPassword,
      });

      // Password should be hashed
      expect(user.password).not.toBe(testPassword);

      // Should be able to verify with comparePassword
      expect(comparePassword(testPassword, user.password)).toBe(true);

      // Clean up
      await user.destroy();
    });
  });
});

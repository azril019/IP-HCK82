const { User } = require("../../models");
const { hashPassword } = require("../../helpers/bcrypt");

jest.mock("../../helpers/bcrypt", () => ({
  hashPassword: jest.fn().mockReturnValue("hashedpassword"),
}));

describe("User Model", () => {
  test("should hash password before creation", async () => {
    // Get the hooks from the User model
    const hooks = User.options.hooks;

    // Create a mock instance with a password
    const user = {
      password: "plainpassword",
      changed: jest.fn().mockReturnValue(true),
      previous: jest.fn(),
    };

    // Call the beforeCreate hook manually
    await hooks.beforeCreate(user);

    // Verify that the password was hashed
    expect(hashPassword).toHaveBeenCalledWith("plainpassword");
    expect(user.password).toBe("hashedpassword");
  });

  test("should hash password before update when changed", async () => {
    // Get the hooks from the User model
    const hooks = User.options.hooks;

    // Create a mock instance with a password that has changed
    const user = {
      password: "newpassword",
      changed: jest
        .fn((field) => field === "password")
        .mockReturnValueOnce(true),
      previous: jest.fn().mockReturnValue("oldpassword"),
    };

    // Call the beforeUpdate hook manually
    await hooks.beforeUpdate(user);

    // Verify that the password was hashed
    expect(hashPassword).toHaveBeenCalledWith("newpassword");
    expect(user.password).toBe("hashedpassword");
  });

  test("should not hash password before update when unchanged", async () => {
    // Get the hooks from the User model
    const hooks = User.options.hooks;

    // Create a mock instance with an unchanged password
    const user = {
      password: "samepassword",
      changed: jest.fn().mockReturnValue(false),
      previous: jest.fn(),
    };

    // Call the beforeUpdate hook manually
    await hooks.beforeUpdate(user);

    // Verify that the password was not hashed
    expect(hashPassword).not.toHaveBeenCalled();
    expect(user.password).toBe("samepassword");
  });
});

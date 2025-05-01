const bcrypt = require("bcryptjs");
const { hashPassword, comparePassword } = require("../../helpers/bcrypt");

jest.mock("bcryptjs");

describe("Bcrypt Helper", () => {
  it("should hash password correctly", () => {
    bcrypt.genSaltSync.mockReturnValue("salt");
    bcrypt.hashSync.mockReturnValue("hashedPassword");

    const result = hashPassword("plainPassword");

    expect(bcrypt.genSaltSync).toHaveBeenCalledWith(10);
    expect(bcrypt.hashSync).toHaveBeenCalledWith("plainPassword", "salt");
    expect(result).toBe("hashedPassword");
  });

  it("should compare password correctly", () => {
    bcrypt.compareSync.mockReturnValue(true);

    const result = comparePassword("plainPassword", "hashedPassword");

    expect(bcrypt.compareSync).toHaveBeenCalledWith(
      "plainPassword",
      "hashedPassword"
    );
    expect(result).toBe(true);
  });

  it("should return false for incorrect password", () => {
    bcrypt.compareSync.mockReturnValue(false);

    const result = comparePassword("wrongPassword", "hashedPassword");

    expect(result).toBe(false);
  });
});

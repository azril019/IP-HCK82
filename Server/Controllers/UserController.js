const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { User } = require("../models");

class UserController {
  static async register(req, res, next) {
    const { email, password, name } = req.body;
    try {
      const user = await User.create({
        email,
        password,
        name,
      });
      console.log("🚀 ~ UserController ~ register ~ user:", user);
      res.status(201).json({
        id: user.id,
        email: user.email,
        name: user.name,
      });
    } catch (error) {
      console.log("🚀 ~ UserController ~ register ~ error:", error);
      next(error); // Gunakan next() untuk meneruskan error
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      const isValidPassword = comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      const access_token = signToken({ id: user.id, email: user.email });
      res.status(200).json({ access_token });
    } catch (error) {
      console.log("🚀 ~ UserController ~ login ~ error:", error);
      next(error); // Gunakan next() untuk meneruskan error
    }
  }
}

module.exports = UserController;

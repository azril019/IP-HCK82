const { User } = require("../models");
const { verifyToken } = require("../helpers/jwt");

const authentication = async (req, res, next) => {
  const bearerToken = req.headers["authorization"];
  if (!bearerToken) {
    next({ name: "Unauthorized", message: "Invalid token" });
    return;
  }

  const [, token] = bearerToken.split(" ");
  if (!token) {
    next({ name: "Unauthorized", message: "Invalid token" });
    return;
  }

  try {
    const data = verifyToken(token);
    const user = await User.findByPk(data.id);

    if (!user) {
      next({ name: "Unauthorized", message: "Invalid token" });
      return;
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authentication;

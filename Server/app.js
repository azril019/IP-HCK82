require("dotenv").config();
const express = require("express");
const app = express();
const port = 3000;
// if (process.env.NODE_ENV !== "production") {
//   require("dotenv").config();
// }
const UserController = require("./Controllers/UserController");
const Controller = require("./Controllers/controller");
const authentication = require("./middlewares/authentication");
const errorHandlers = require("./Controllers/errorHandlers");
const cors = require("cors");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();
const { User } = require("./models");
const { hashPassword } = require("./helpers/bcrypt");
const { signToken } = require("./helpers/jwt");

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.post("/google-login", async (req, res, next) => {
  const { googleToken } = req.body;
  if (!googleToken) {
    throw { name: "BadRequest", message: "Google token is required" };
  }
  try {
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
    const payload = ticket.getPayload();
    if (!payload || !payload.email_verified) {
      throw { name: "BadRequest", message: "Invalid google token" };
    }
    const [user, created] = await User.findOrCreate({
      where: { email: payload.email },
      defaults: {
        name: payload.name || "Google User",
        email: payload.email,
        provider: "google",
        password: hashPassword("google_id"),
      },
      hooks: false,
    });

    const access_token = signToken({ id: user.id });

    res
      .status(created ? 201 : 200)
      .json({ message: "Success login with google", access_token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    next(error);
  }
});

app.post("/register", UserController.register);
app.post("/login", UserController.login);
app.use(authentication);
app.get("/profile", Controller.getProfile);
app.delete("/profile", Controller.deleteProfile);
app.post("/preference", Controller.addPreference);
app.put("/preference/:id", Controller.editPreference);
app.get("/preference", Controller.getPreference);
app.delete("/preference/:id", Controller.deletePreference);
app.get("/recommendations", Controller.getRecommendationFromAi);
app.get("/external-data/:id", Controller.getExternalData);

app.use(errorHandlers);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;

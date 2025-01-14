const express = require("express");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchUser = require("../middleware/fetch_user");

const JWT_SECRET = "Datta@123";

// ROUTE 1: Create a Use using : POST "/api/auth/create-user" Does'nt require auth
router.post(
  "/create-user",
  [
    body("email", "Enter a valid email.").isEmail(),
    body("name", "Enter a valid name.").isLength({ min: 2 }),
    body("password", "Enter a valid password.").isLength({ min: 5 }),
  ],
  async (req, resp) => {
    try {
      const result = validationResult(req);
      if (result.isEmpty()) {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
          return resp
            .status(400)
            .json({ error: "User with this email already exists." });
        } else {
          const salt = await bcrypt.genSalt(10);
          const secPass = await bcrypt.hash(req.body.password, salt);
          user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
          });
          const data = {
            user: {
              id: user.id,
            },
          };
          const authToken = jwt.sign(data, JWT_SECRET);
          resp.json({ authToken: authToken });
        }
      } else {
        return resp.send({ errors: result.array() });
      }
    } catch (error) {
      resp.status(500).json(error);
    }
  }
);

// ROUTE 2: Authenticate a user using : POST "/api/auth/login", No login required
router.post(
  "/login",
  [
    body("email", "Enter a valid email.").isEmail(),
    body("password", "Password can not be blank.").exists(),
  ],
  async (req, resp) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const { email, password } = req.body;
      let user = await User.findOne({ email });
      if (!user) {
        return resp
          .status(400)
          .json({ error: "Please try to login with correct credentials." });
      } else {
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
          return resp
            .status(400)
            .json({ error: "Please try to login with correct credentials." });
        } else {
          const data = {
            user: {
              id: user.id,
            },
          };
          const authToken = jwt.sign(data, JWT_SECRET);
          resp.json({ authToken: authToken });
        }
      }
      try {
      } catch (error) {
        resp.status(500).json(error);
      }
    } else {
      return resp.send({ errors: result.array() });
    }
  }
);

// ROUTE 3: Get logged in user details using : POST "/api/auth/getuser", Login required
router.post("/get-user-data", fetchUser, async (req, resp) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    resp.send(user);
  } catch (error) {
    resp.status(500).json(error);
  }
});
module.exports = router;

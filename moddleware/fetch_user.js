const jwt = require("jsonwebtoken");

const JWT_SECRET = "Datta@123";

const fetchUser = (req, resp, next) => {
  // Get the user from the jwt token and add id to req obj
  const token = req.header("auth-token");
  if (!token) {
    resp.status(401).send({ error: "Please authenticate using a valid token" });
  }
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    resp.status(401).send({ error: "Please authenticate using a valid token" });
  }
};

module.exports = fetchUser;

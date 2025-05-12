const express = require("express");
const csrf = require("csrf");
const session = require("express-session");
const {
  loginUser,
  signUpUser,
  changeUsername,
} = require("../controller/userController");
const authMiddleware = require("../utils/authMiddleware");

const userRouter = express.Router();
const tokens = new csrf();

// Configure session middleware
userRouter.use(
  session({
    secret: "your-secret-key", 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, 
  })
);

// Middleware to generate CSRF token
const csrfMiddleware = async (req, res, next) => {
  if (!req.session.csrfSecret) {
    req.session.csrfSecret = tokens.secretSync();
  }
  req.csrfToken = tokens.create(req.session.csrfSecret);
  next();
};

// Middleware to verify CSRF token
const csrfProtection = (req, res, next) => {
  const csrfToken = req.headers["x-csrf-token"];
  const csrfSecret = req.session.csrfSecret;
  console.log("Printing secrets")

  console.log(csrfToken, csrfSecret);

  if (!csrfSecret || !csrfToken || !tokens.verify(csrfSecret, csrfToken)) {
    return res.status(403).json({ error: "Invalid or missing CSRF token" });
  }
  next();
};

// Routes
userRouter.get("/csrf-token", csrfMiddleware, (req, res) => {
  res.json({ csrfToken: req.csrfToken });
});

userRouter.post("/login", loginUser);
userRouter.post("/signup", signUpUser);
userRouter.post(
  "/change-username",
  authMiddleware,
  csrfProtection,
  changeUsername
);

module.exports = userRouter;

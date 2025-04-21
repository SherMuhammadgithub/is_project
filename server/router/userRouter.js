const express = require("express");

const { loginUser, signUpUser } = require("../controller/userController");

const userRouter = express.Router();

// Test route to verify router is working
userRouter.get("/test", (req, res) => {
  res.status(200).json({ message: "User router is working correctly!" });
});

// User routes
userRouter.post("/login", loginUser);
userRouter.post("/signup", signUpUser);

module.exports = userRouter;

const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
    },
    process.env.JWT_SECRET || "your_jwt_secret_key",
    { expiresIn: "24h" }
  );
};

module.exports = {
  generateToken,
};

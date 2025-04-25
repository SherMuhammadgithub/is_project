const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
    },
    process.env.JWT_SECRET || "secretasdlju3qep012hk",
    { expiresIn: "24h" }
  );
};

module.exports = {
  generateToken,
};

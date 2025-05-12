const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    console.log("Checking for Authorization header...");
    console.log("Headers:", req.headers);

    const authHeader = req.headers.authorization;
    console.log("Authorization Header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "No authentication token, access denied" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token from Authorization header:", token);

    const decoded = jwt.verify(token, "your_jwt_secret_key");
    console.log("Decoded Token:", decoded);

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = authMiddleware;

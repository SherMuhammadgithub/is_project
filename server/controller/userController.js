const pool = require("../db/db.js"); // Fix the path to the database connection
const axios = require("axios");

// Signup Endpoint
const signUpUser = (req, res) => {
  const { username, password } = req.body;
  const checkQuery = "SELECT * FROM Users WHERE username = $1";
  pool.query(checkQuery, [username], (err, results) => {
    if (err) return res.status(500).json({ error: "Error checking user data" });

    if (results.rows.length > 0) {
      res.status(409).json({ error: "Username already exists." });
    } else {
      const insertQuery =
        "INSERT INTO Users (username, userpassword) VALUES ($1, $2)";
      pool.query(insertQuery, [username, password], (err) => {
        if (err)
          return res.status(500).json({ error: "Error inserting user data" });
        res.status(200).json({ message: "Signup successful!" });
      });
    }
  });
};

// Login Endpoint
const loginUser = (req, res) => {
  const { username, password } = req.body;
  const query = "SELECT * FROM Users WHERE username = $1 AND userpassword = $2";
  pool.query(query, [username, password], (err, results) => {
    if (err) return res.status(500).json({ error: "Error fetching user data" });

    if (results.rows.length > 0) {
      res.status(200).json({ message: "Login successful!", user: results.rows[0] });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });
};

module.exports = {
  signUpUser,
  loginUser
};

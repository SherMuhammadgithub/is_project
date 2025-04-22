const pool = require("../db/db.js");
const bcrypt = require('bcrypt');
const { JSDOM } = require('jsdom');
const { sanitize } = require('dompurify')(new JSDOM('').window);
const saltRounds = 10;

const cleanInput = (input) => {
  if (typeof input !== 'string') return input;
  return sanitize(input, {
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [], 
    FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed','h1','div','span'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick']
  });
};

const signUpUser = (req, res) => {
  const username = cleanInput(req.body.username);
  const password = cleanInput(req.body.password);

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  pool.query("SELECT * FROM Users WHERE username = $1", [username], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Error checking user data" });
    }

    if (result.rows.length > 0) {
      return res.status(409).json({ error: "Username already exists." });
    }

    bcrypt.hash(password, saltRounds, (hashErr, hashedPassword) => {
      if (hashErr) {
        console.error("Hashing error:", hashErr);
        return res.status(500).json({ error: "Error creating account" });
      }

      pool.query(
        "INSERT INTO Users (username, userpassword) VALUES ($1, $2) RETURNING id, username",
        [username, hashedPassword],
        (insertErr, insertResult) => {
          if (insertErr) {
            console.error("Insert error:", insertErr);
            return res.status(500).json({ error: "Error creating account" });
          }

          const safeUser = {
            id: insertResult.rows[0].id,
            username: cleanInput(insertResult.rows[0].username)
          };

          res.status(201).json({ 
            message: "Signup successful!",
            user: safeUser
          });
        }
      );
    });
  });
};

const loginUser = (req, res) => {
  const username = cleanInput(req.body.username);
  const password = cleanInput(req.body.password);

  pool.query("SELECT * FROM Users WHERE username = $1", [username], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Error during login" });
    }

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

    bcrypt.compare(password, user.userpassword, (compareErr, passwordMatch) => {
      if (compareErr) {
        console.error("Comparison error:", compareErr);
        return res.status(500).json({ error: "Error during login" });
      }

      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const safeUser = {
        id: user.id,
        username: cleanInput(user.username)
      };

      res.status(200).json({ 
        message: "Login successful!",
        user: safeUser
      });
    });
  });
};

const securityHeaders = (req, res, next) => {
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
};

module.exports = {
  signUpUser,
  loginUser,
  securityHeaders
};
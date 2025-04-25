const pool = require("../db/db.js"); // Fix the path to the database connection
const axios = require("axios");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/jwtUtils.js");
const pool = require("../db/db.js");
const { JSDOM } = require('jsdom');
const { sanitize } = require('dompurify')(new JSDOM('').window);
const crypto = require('crypto');

const SECRET_KEY = 'process.env.FEISTEL_SECRET_KEY';

const cleanInput = (input) => {
  if (typeof input !== 'string') return input;
  return sanitize(input, {
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [], 
    FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed','h1','div','span'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick']
  });
};

class FeistelCipher {
  constructor(rounds = 8) {
    this.rounds = rounds;
  }

  generateRoundKey(round) {
    return crypto.createHmac('sha256', SECRET_KEY)
      .update(`round-${round}`)
      .digest('hex');
  }

  roundFunction(right, roundKey) {
    const hmac = crypto.createHmac('sha256', roundKey)
      .update(right)
      .digest('hex');
    return hmac.slice(0, right.length); 
  }

  stringToBinary(str) {
    return Buffer.from(str, 'utf8').toString('hex');
  }

  binaryToString(binary) {
    return Buffer.from(binary, 'hex').toString('utf8');
  }

  splitBlocks(data) {
    const midpoint = Math.ceil(data.length / 2);
    return [data.slice(0, midpoint), data.slice(midpoint)];
  }

  encrypt(plaintext) {
    let binary = this.stringToBinary(plaintext);

    if (binary.length % 2 !== 0) {
      binary += '0';
    }

    let [left, right] = this.splitBlocks(binary);

    for (let round = 0; round < this.rounds; round++) {
      const roundKey = this.generateRoundKey(round);
      const temp = right;

      right = this.xorHex(left, this.roundFunction(right, roundKey));
      left = temp;
    }

    return left + right;
  }

  decrypt(ciphertext) {
    let [left, right] = this.splitBlocks(ciphertext);
    for (let round = this.rounds - 1; round >= 0; round--) {
      const roundKey = this.generateRoundKey(round);
      const temp = left;

      left = this.xorHex(right, this.roundFunction(left, roundKey));
      right = temp;
    }

    try {
      return this.binaryToString(left + right);
    } catch (e) {
      return '';
    }
  }

  xorHex(a, b) {
    const minLength = Math.min(a.length, b.length);
    let result = '';
    
    for (let i = 0; i < minLength; i++) {
      const xorValue = (parseInt(a[i], 16) ^ parseInt(b[i], 16)).toString(16);
      result += xorValue;
    }

    result += a.slice(minLength) || b.slice(minLength);
    
    return result;
  }
}

const feistel = new FeistelCipher(12); 

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const encrypted = feistel.encrypt(password + salt);
  return `${salt}:${encrypted}`;
};

const verifyPassword = (password, storedHash) => {
  const [salt, encrypted] = storedHash.split(':');
  const testEncrypted = feistel.encrypt(password + salt);
  return crypto.timingSafeEqual(
    Buffer.from(encrypted, 'utf8'),
    Buffer.from(testEncrypted, 'utf8')
  );
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

    const hashedPassword = hashPassword(password);

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

    try {
      const passwordMatch = verifyPassword(password, user.userpassword);
      
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
    } catch (error) {
      console.error("Verification error:", error);
      return res.status(500).json({ error: "Error during login" });
    }
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

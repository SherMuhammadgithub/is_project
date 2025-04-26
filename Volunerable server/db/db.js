const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "is_project_db",
  port: process.env.DB_PORT || 5432,
  max: 10,
  idleTimeoutMillis: 30000,
});

module.exports = pool;

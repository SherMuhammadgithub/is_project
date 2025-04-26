const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config();
const rateLimit = require("express-rate-limit");
const geoip = require('geoip-lite');

function blockIsrael(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const geo = geoip.lookup(ip);

  if (geo && geo.country === 'IL') {
    return res.status(403).json({ error: 'Access from Israel is blocked.' });
  }

  next();
}

const bannedIPs = new Map(); 

// Import routes
const userRouter = require("./router/userRouter");
const bookingRouter = require("./router/bookingRouter");
const flightRouter = require("./router/flightRouter");
const orderRouter = require("./router/orderRoute"); // Import order router

const app = express();
app.use(blockIsrael);
app.use((req, res, next) => {
  const ip = req.ip;
  const unblockTime = bannedIPs.get(ip);
  if (unblockTime && unblockTime > Date.now()) {
    console.log(`Blocked IP ${ip} attempted access to ${req.url}`);
    return res.status(429).json({
      error: "Too many requests. You have been temporarily blocked for some minute.",
    });
  }
  next();
});

const APIlimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,           
  handler: (req, res, next) => {
    const ip = req.ip;
    bannedIPs.set(ip, Date.now() + 60 * 1000); 
    console.log(`IP ${ip} has been temporarily blocked for 1 minute.`);
    res.status(429).json({
      error: "Too many requests. You have been temporarily blocked for 1 minute.",
    });
  },
});

// const loginLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, 
//   max: 15, 

//   handler: (req, res, next) => {
//     const ip = req.ip;
//     bannedIPs.set(ip, Date.now() + 300 * 1000); 
//     console.log(`IP ${ip} has been temporarily blocked for 1 minute.`);
//     res.status(429).json({
//       error: "Too many login attempts, please try again later",
//     });
//   },
// });


// Add logging first, before ANYTHING else
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.ip} - ${req.method} ${req.url}`);
  next();
});

// CORS Configuration - Must be before other middleware
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000", // Allow requests from your local frontend
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Duffel-Version"],
  exposedHeaders: ["Content-Type", "Authorization", "Duffel-Version"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400, // Enable CORS preflight cache for 24 hours
};



// Apply CORS middleware before routes
app.use(cors(corsOptions));

// Body parser middleware
app.use(bodyParser.json());

// Test route to verify Express app is working
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running correctly!" });
});

// User routes
app.use("/api/users",APIlimiter, userRouter);
// app.use("/api/users",loginLimiter, userRouter);

// Booking routes
app.use("/api/bookings",bookingRouter);

// Flight routes
app.use("/api/flights",flightRouter);

// Order routes
app.use("/api/orders",orderRouter); // Use the order router

// Proxy middleware for Duffel API
app.use(
  "/api",
  createProxyMiddleware({
    target: "https://api.duffel.com",
    changeOrigin: true,
    pathRewrite: { "^/api": "" },
    timeout: 120000, // Increase timeout to 120 seconds
    proxyTimeout: 120000,
    onError: (err, req, res) => {
      console.error("Proxy Error:", err);
      res
        .status(500)
        .json({ error: "Proxy request failed", details: err.message });
    },
    onProxyReq: (proxyReq, req, res) => {
      // Log incoming request details
      console.log("Incoming request:", req.method, req.url);
      console.log("Request headers:", req.headers);
      console.log("Request body:", req.body);

      // Set Duffel-specific headers
      if (req.headers["authorization"]) {
        proxyReq.setHeader("Authorization", req.headers["authorization"]);
      } else {
        proxyReq.setHeader(
          "Authorization",
          `Bearer ${process.env.DUFFEL_TEST_API_KEY}`
        );
      }
      proxyReq.setHeader("Duffel-Version", "v2");

      // Handle POST request body
      if (req.method === "POST" && req.body) {
        const bodyData = JSON.stringify(req.body);
        console.log("Request body being sent to Duffel API:", bodyData);
        proxyReq.setHeader("Content-Type", "application/json");
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      // Log proxy response details
      console.log("Proxy response status:", proxyRes.statusCode);
      console.log("Proxy response headers:", proxyRes.headers);

      // Set CORS headers for the response
      proxyRes.headers["Access-Control-Allow-Origin"] =
        process.env.CORS_ORIGIN || "http://localhost:3000";
      proxyRes.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
      proxyRes.headers["Access-Control-Allow-Headers"] =
        "Content-Type, Authorization, Duffel-Version";
      proxyRes.headers["Access-Control-Allow-Credentials"] = "true";

      // Log the response body (if needed)
      let body = "";
      proxyRes.on("data", (chunk) => {
        body += chunk;
      });
      proxyRes.on("end", () => {
        console.log("Proxy response body:", body);
      });
    },
  })
);

// Export Express app as a Vercel serverless function
module.exports = app;

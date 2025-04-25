const express = require("express");

const {
  createOrder,
  fetchOrderById,
} = require("../controller/orderController.js");
const authMiddleware = require("../utils/authMiddleware.js");

const orderRoutes = express.Router();

// Test route to verify router is working
orderRoutes.get("/test", (req, res) => {
  res.status(200).json({ message: "Flight router is working correctly!" });
});
orderRoutes.get("/fetch-order/:id", authMiddleware, fetchOrderById);

orderRoutes.post("/create-order", authMiddleware, createOrder);

module.exports = orderRoutes;

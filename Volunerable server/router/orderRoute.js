const express = require("express");

const {
  createOrder,
  fetchOrderById,
} = require("../controller/orderController.js");

const orderRoutes = express.Router();

// Test route to verify router is working
orderRoutes.get("/test", (req, res) => {
  res.status(200).json({ message: "Flight router is working correctly!" });
});
orderRoutes.get("/fetch-order/:id", fetchOrderById);

orderRoutes.post("/create-order", createOrder);

module.exports = orderRoutes;

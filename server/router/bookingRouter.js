const express = require("express");
const {
  getUserBookings,
  createBooking,
} = require("../controller/bookingController");

const bookingRouter = express.Router();

// Test route to verify router is working
bookingRouter.get("/test", (req, res) => {
  res.status(200).json({ message: "Booking router is working correctly!" });
});

// Booking routes
bookingRouter.get("/:username", getUserBookings);
bookingRouter.post("/", createBooking);

module.exports = bookingRouter;

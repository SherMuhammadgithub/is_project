const express = require("express");
const { getFlightOffers } = require("../controller/flightController");

const flightRouter = express.Router();

// Test route to verify router is working
flightRouter.get("/test", (req, res) => {
  res.status(200).json({ message: "Flight router is working correctly!" });
});

// Flight routes
flightRouter.post("/get-flight-offers", getFlightOffers);

module.exports = flightRouter;

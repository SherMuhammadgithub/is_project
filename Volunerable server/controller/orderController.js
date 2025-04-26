const axios = require("axios");
const { fetchFromDuffelAPI } = require("./flightController.js");

const createOrder = async (req, res) => {
  try {
    const requestData = req.body; // Payload from the frontend
    const endpoint = "air/orders"; // Duffel API endpoint for creating orders

    const responseData = await fetchFromDuffelAPI(
      endpoint,
      "POST",
      requestData
    );

    res.status(200).json(responseData);
  } catch (error) {
    console.error(
      "Error creating order:",
      error.response?.data || error.message
    );

    res.status(error.response?.status || 500).json({
      error: "An error occurred while creating the order.",
      details: error.response?.data || error.message,
    });
  }
};

const fetchOrderById = async (req, res) => {
  try {
    const { id } = req.params; // Extract the order ID from the route parameters
    const endpoint = `air/orders/${id}`; // Duffel API endpoint for fetching an order by ID

    const responseData = await fetchFromDuffelAPI(endpoint, "GET");

    res.status(200).json(responseData);
  } catch (error) {
    console.error(
      "Error fetching order:",
      error.response?.data || error.message
    );

    res.status(error.response?.status || 500).json({
      error: "An error occurred while fetching the order.",
      details: error.response?.data || error.message,
    });
  }
};

module.exports = {
  createOrder, // Export the new function
  fetchOrderById, // Export the new function to fetch order by ID
};

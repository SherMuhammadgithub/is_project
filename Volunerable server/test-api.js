const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function testAPI() {
  try {
    // Test the root endpoint
    console.log('Testing root endpoint...');
    const rootResponse = await axios.get(`${API_URL}/`);
    console.log('Root response:', rootResponse.data);

    // Test the user router test endpoint
    console.log('\nTesting user router test endpoint...');
    const userTestResponse = await axios.get(`${API_URL}/api/users/test`);
    console.log('User router test response:', userTestResponse.data);

    // Test the signup endpoint
    console.log('\nTesting signup endpoint...');
    const signupResponse = await axios.post(`${API_URL}/api/users/signup`, {
      username: 'testuser',
      password: 'testpassword'
    });
    console.log('Signup response:', signupResponse.data);

    // Test the login endpoint
    console.log('\nTesting login endpoint...');
    const loginResponse = await axios.post(`${API_URL}/api/users/login`, {
      username: 'testuser',
      password: 'testpassword'
    });
    console.log('Login response:', loginResponse.data);

    // Test the booking router test endpoint
    console.log('\nTesting booking router test endpoint...');
    const bookingTestResponse = await axios.get(`${API_URL}/api/bookings/test`);
    console.log('Booking router test response:', bookingTestResponse.data);

    // Test the get bookings endpoint
    console.log('\nTesting get bookings endpoint...');
    const getBookingsResponse = await axios.get(`${API_URL}/api/bookings/testuser`);
    console.log('Get bookings response:', getBookingsResponse.data);

    // Test the create booking endpoint
    console.log('\nTesting create booking endpoint...');
    const createBookingResponse = await axios.post(`${API_URL}/api/bookings`, {
      username: 'testuser',
      orderid: 'test-order-123'
    });
    console.log('Create booking response:', createBookingResponse.data);

    // Test the flight router test endpoint
    console.log('\nTesting flight router test endpoint...');
    const flightTestResponse = await axios.get(`${API_URL}/api/flights/test`);
    console.log('Flight router test response:', flightTestResponse.data);

    // Test the get flight offers endpoint
    console.log('\nTesting get flight offers endpoint...');
    const getFlightOffersResponse = await axios.post(`${API_URL}/api/flights/get-flight-offers`, {
      data: {
        slices: [
          {
            origin: "LHR",
            destination: "JFK",
            departure_date: "2023-06-01"
          }
        ],
        passengers: [
          {
            type: "adult"
          }
        ],
        cabin_class: "economy"
      }
    });
    console.log('Get flight offers response:', getFlightOffersResponse.data);

  } catch (error) {
    console.error('Error testing API:', error.response ? error.response.data : error.message);
  }
}

// Run the tests
testAPI(); 
const axios = require('axios');

const TARGET_URL = 'http://localhost:5000';
const TARGET_ENDPOINT = '/api/users/login';
const TOTAL_REQUESTS = 100;
const BATCH_SIZE = 10;

const results = {
  success: 0,
  failures: 0,
  rateLimited: 0
};


async function runAttack() {
  console.log(`Starting attack with ${TOTAL_REQUESTS} requests in batches of ${BATCH_SIZE}`);

  const numberOfBatches = Math.ceil(TOTAL_REQUESTS / BATCH_SIZE);
  
  for (let batch = 0; batch < numberOfBatches; batch++) {
    console.log(`Processing batch ${batch + 1}/${numberOfBatches}`);

    const requestsInThisBatch = Math.min(BATCH_SIZE, TOTAL_REQUESTS - (batch * BATCH_SIZE));
 
    const batchPromises = [];
    for (let i = 0; i < requestsInThisBatch; i++) {
      const requestNumber = (batch * BATCH_SIZE) + i + 1;
      batchPromises.push(makeRequest(requestNumber));
    }

    const batchResults = await Promise.all(batchPromises);

    batchResults.forEach(result => {
      if (result.success) results.success++;
      else {
        results.failures++;
        if (result.status === 429) results.rateLimited++;
      }
    });
  }
  
  console.log('\nFinal Results:');
  console.log(`Successful: ${results.success}`);
  console.log(`Failed: ${results.failures}`);
  console.log(`Rate Limited: ${results.rateLimited}`);
}

async function makeRequest(id) {
    try {
      const payload = {
        username: `user${Math.floor(Math.random() * 1000)}`,
        password: `password${Math.floor(Math.random() * 1000)}`
      };
      
      const response = await axios.post(`${TARGET_URL}${TARGET_ENDPOINT}`, payload, {
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log(`Request #${id} - Success (Status: ${response.status})`);
      return { success: true, status: response.status };
      
    } catch (error) {
      const status = error.response?.status || 'CONN_ERROR';
      const errorDetails = error.response?.data || error.message;
      
      console.log(`Failed (Status: ${status})`);
      console.log(`   Full error details:`, errorDetails);
      
      return { 
        success: false, 
        status,
        details: errorDetails
      };
    }
  }
runAttack();
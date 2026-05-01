const axios = require('axios');
const tokens = require('./src/utils/tokens');

async function testRefresh() {
  try {
    console.log('=== TESTING REFRESH ENDPOINT ===');
    const { refreshToken, username } = tokens.getTokens();
    console.log('Username:', username);
    console.log('Refresh token:', refreshToken);
    
    if (!refreshToken) {
      console.log('No refresh token found!');
      return;
    }
    
    console.log('\nCalling /auth/refresh...');
    const response = await axios.post('https://hng14-backend-node-js-stage3-backen.vercel.app/auth/refresh', {
      refresh_token: refreshToken
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Refresh success!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('Refresh failed:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

testRefresh();
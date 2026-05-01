const axios = require('axios');
const tokens = require('./src/utils/tokens');

async function checkToken() {
  try {
    console.log('=== CHECKING TOKEN AFTER LOGIN ===');
    const { accessToken, refreshToken, username } = tokens.getTokens();
    console.log('Username:', username);
    console.log('Access Token:', accessToken);
    console.log('Token length:', accessToken?.length);
    console.log('Refresh Token:', refreshToken);
    
    if (!accessToken) {
      console.log('No token found!');
      return;
    }
    
    console.log('\nCalling /auth/me with token...');
    const response = await axios.get('https://hng14-backend-node-js-stage3-backen.vercel.app/auth/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('SUCCESS! Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('ERROR:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response data:', error.response.data);
      console.log('Response headers:', error.response.headers);
    } else if (error.request) {
      console.log('No response received');
    } else {
      console.log('Error:', error.message);
    }
  }
}

checkToken();
const tokens = require('./src/utils/tokens');

console.log('Checking stored tokens...');
const { accessToken, refreshToken, username } = tokens.getTokens();
console.log('Username:', username);
console.log('Access Token:', accessToken);
console.log('Refresh Token:', refreshToken);
console.log('Token length:', accessToken?.length);
console.log('Token preview:', accessToken?.substring(0, 50) + '...');
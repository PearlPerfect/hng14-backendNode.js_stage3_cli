const axios  = require('axios');
const tokens = require('./tokens');

const BASE_URL = process.env.INSIGHTA_API_URL || 'https://your-api.vercel.app';

async function request(method, path, data = null, params = {}) {
  const { accessToken, refreshToken } = tokens.getTokens();

  try {
    const res = await axios({
      method, url: `${BASE_URL}${path}`,
      data, params,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-API-Version': '1',
        'Content-Type': 'application/json',
      },
    });
    return res.data;
  } catch (err) {
    // Auto-refresh on 401 TOKEN_EXPIRED
    if (err.response?.status === 401 && err.response?.data?.code === 'TOKEN_EXPIRED' && refreshToken) {
      try {
        const refreshRes = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refreshToken });
        const { access_token, refresh_token } = refreshRes.data;
        const { username } = tokens.getTokens();
        tokens.saveTokens({ accessToken: access_token, refreshToken: refresh_token, username });

        // Retry original request with new token
        const retryRes = await axios({
          method, url: `${BASE_URL}${path}`,
          data, params,
          headers: {
            Authorization: `Bearer ${access_token}`,
            'X-API-Version': '1',
            'Content-Type': 'application/json',
          },
        });
        return retryRes.data;
      } catch {
        tokens.clearTokens();
        throw new Error('Session expired. Please run: insighta login');
      }
    }
    throw new Error(err.response?.data?.message || err.message);
  }
}

module.exports = { request, BASE_URL };
const axios = require('axios');
const tokens = require('./tokens');

const BASE_URL = process.env.INSIGHTA_API_URL || 'http://localhost:3000';

async function request(method, path, data = null, params = {}) {
  const { accessToken, refreshToken } = tokens.getTokens();

  async function makeRequest(token) {
    const config = {
      method,
      url: `${BASE_URL}${path}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-API-Version': '1',
        'Content-Type': 'application/json',
      },
      validateStatus: () => true, // don't throw on any status code
    };
    if (data)   config.data   = data;
    if (params) config.params = params;

    const res = await axios(config);

    // Handle empty / non-JSON responses safely
    let body;
    if (!res.data || res.data === '' || res.data === null) {
      body = { status: 'error', message: 'Empty response from server' };
    } else if (typeof res.data === 'string') {
      try {
        body = JSON.parse(res.data);
      } catch {
        body = { status: 'error', message: `Server returned: ${res.data.slice(0, 100)}` };
      }
    } else {
      body = res.data;
    }

    return { status: res.status, body };
  }

  let { status, body } = await makeRequest(accessToken);

  // Auto-refresh on 401 TOKEN_EXPIRED
  if (status === 401 && body?.code === 'TOKEN_EXPIRED' && refreshToken) {
    try {
      const refreshRes = await axios.post(
        `${BASE_URL}/auth/refresh`,
        { refresh_token: refreshToken },
        { validateStatus: () => true }
      );
      if (refreshRes.data?.access_token) {
        const { username } = tokens.getTokens();
        tokens.saveTokens({
          accessToken:  refreshRes.data.access_token,
          refreshToken: refreshRes.data.refresh_token,
          username,
        });
        const retry = await makeRequest(refreshRes.data.access_token);
        status = retry.status;
        body   = retry.body;
      } else {
        tokens.clearTokens();
        throw new Error('Session expired. Please run: insighta login');
      }
    } catch (e) {
      if (e.message.includes('insighta login')) throw e;
      tokens.clearTokens();
      throw new Error('Session expired. Please run: insighta login');
    }
  }

  if (status === 401) {
    tokens.clearTokens();
    throw new Error('Session expired. Please run: insighta login');
  }

  return { status, body };
}

module.exports = { request, BASE_URL };
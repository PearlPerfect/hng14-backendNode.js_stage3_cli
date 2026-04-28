const Conf  = require('conf');
const store = new Conf({ projectName: 'insighta' });

function saveTokens({ accessToken, refreshToken, username }) {
  store.set('access_token',  accessToken);
  store.set('refresh_token', refreshToken);
  store.set('username',      username);
}

function getTokens() {
  return {
    accessToken:  store.get('access_token'),
    refreshToken: store.get('refresh_token'),
    username:     store.get('username'),
  };
}

function clearTokens() {
  store.clear();
}

function isLoggedIn() {
  return !!store.get('access_token');
}

module.exports = { saveTokens, getTokens, clearTokens, isLoggedIn };
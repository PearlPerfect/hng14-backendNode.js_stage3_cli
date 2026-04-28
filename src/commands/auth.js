const crypto  = require('crypto');
const http    = require('http');
const open    = require('open');
const ora     = require('ora');
const chalk   = require('chalk');
const { BASE_URL, request } = require('../utils/api');
const tokens  = require('../utils/tokens');

// PKCE helpers
function base64url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
function generatePKCE() {
  const verifier  = base64url(crypto.randomBytes(32));
  const challenge = base64url(crypto.createHash('sha256').update(verifier).digest());
  return { verifier, challenge };
}

async function login() {
  if (tokens.isLoggedIn()) {
    const { username } = tokens.getTokens();
    console.log(chalk.green(`Already logged in as @${username}`));
    return;
  }

  const state = crypto.randomBytes(16).toString('hex');
  const { verifier, challenge } = generatePKCE();
  const PORT = 9876;

  const spinner = ora('Opening GitHub login in your browser...').start();

  // Start temporary local server to catch the callback
  await new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url, `http://localhost:${PORT}`);
      if (url.pathname !== '/callback') { res.end(); return; }

      const accessToken  = url.searchParams.get('access_token');
      const refreshToken = url.searchParams.get('refresh_token');
      const username     = url.searchParams.get('username');

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<html><body><h2>Login successful! You can close this tab.</h2></body></html>');
      server.close();

      if (accessToken && refreshToken) {
        tokens.saveTokens({ accessToken, refreshToken, username });
        spinner.succeed(chalk.green(`Logged in as @${username}`));
        resolve();
      } else {
        spinner.fail('Login failed — no tokens received');
        reject(new Error('No tokens'));
      }
    });

    server.listen(PORT, () => {
      const loginUrl = `${BASE_URL}/auth/github?code_challenge=${challenge}&code_challenge_method=S256&state=${state}&port=${PORT}`;
      open(loginUrl);
    });

    setTimeout(() => { server.close(); reject(new Error('Login timed out after 2 minutes')); }, 120000);
  });
}

async function logout() {
  if (!tokens.isLoggedIn()) { console.log(chalk.yellow('Not logged in.')); return; }
  const spinner = ora('Logging out...').start();
  try {
    const { refreshToken } = tokens.getTokens();
    await request('POST', '/auth/logout', { refresh_token: refreshToken });
    tokens.clearTokens();
    spinner.succeed('Logged out successfully.');
  } catch {
    tokens.clearTokens();
    spinner.succeed('Logged out.');
  }
}

async function whoami() {
  if (!tokens.isLoggedIn()) { console.log(chalk.yellow('Not logged in. Run: insighta login')); return; }
  const spinner = ora('Fetching account info...').start();
  try {
    const res = await request('GET', '/auth/me');
    spinner.stop();
    const { username, email, role, last_login_at } = res.data;
    console.log(chalk.cyan(`Username:   `) + username);
    console.log(chalk.cyan(`Email:      `) + email);
    console.log(chalk.cyan(`Role:       `) + role);
    console.log(chalk.cyan(`Last login: `) + last_login_at);
  } catch (err) { spinner.fail(err.message); }
}

module.exports = { login, logout, whoami };
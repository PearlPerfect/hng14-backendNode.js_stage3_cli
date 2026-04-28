const ora    = require('ora');
const chalk  = require('chalk');
const fs     = require('fs');
const path   = require('path');
const axios  = require('axios');
const { request, BASE_URL } = require('../utils/api');
const tokens = require('../utils/tokens');
const { printTable, printProfile, printPagination } = require('../utils/display');

function requireLogin() {
  if (!tokens.isLoggedIn()) {
    console.error(chalk.red('Not logged in. Run: insighta login'));
    process.exit(1);
  }
}

async function list(opts) {
  requireLogin();
  const spinner = ora('Fetching profiles...').start();
  try {
    const params = {};
    if (opts.gender)    params.gender    = opts.gender;
    if (opts.country)   params.country_id = opts.country;
    if (opts.ageGroup)  params.age_group = opts.ageGroup;
    if (opts.minAge)    params.min_age   = opts.minAge;
    if (opts.maxAge)    params.max_age   = opts.maxAge;
    if (opts.sortBy)    params.sort_by   = opts.sortBy;
    if (opts.order)     params.order     = opts.order;
    if (opts.page)      params.page      = opts.page;
    if (opts.limit)     params.limit     = opts.limit;

    const res = await request('GET', '/api/profiles', null, params);
    spinner.stop();
    printTable(res.data);
    printPagination(res);
  } catch (err) { spinner.fail(err.message); }
}

async function get(id) {
  requireLogin();
  const spinner = ora(`Fetching profile ${id}...`).start();
  try {
    const res = await request('GET', `/api/profiles/${id}`);
    spinner.stop();
    printProfile(res.data);
  } catch (err) { spinner.fail(err.message); }
}

async function search(query, opts) {
  requireLogin();
  const spinner = ora(`Searching: "${query}"...`).start();
  try {
    const res = await request('GET', '/api/profiles/search', null, {
      q: query, page: opts.page || 1, limit: opts.limit || 10,
    });
    spinner.stop();
    printTable(res.data);
    printPagination(res);
  } catch (err) { spinner.fail(err.message); }
}

async function create(opts) {
  requireLogin();
  if (!opts.name) { console.error(chalk.red('--name is required')); process.exit(1); }
  const spinner = ora(`Creating profile for "${opts.name}"...`).start();
  try {
    const res = await request('POST', '/api/profiles', { name: opts.name });
    spinner.succeed('Profile created.');
    printProfile(res.data);
  } catch (err) { spinner.fail(err.message); }
}

async function exportProfiles(opts) {
  requireLogin();
  const spinner = ora('Exporting profiles as CSV...').start();
  try {
    const { accessToken } = tokens.getTokens();
    const params = {};
    if (opts.gender)  params.gender    = opts.gender;
    if (opts.country) params.country_id = opts.country;
    if (opts.format)  params.format    = opts.format;

    const res = await axios.get(`${BASE_URL}/api/profiles/export`, {
      params,
      headers: { Authorization: `Bearer ${accessToken}`, 'X-API-Version': '1' },
      responseType: 'text',
    });

    const ts       = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `profiles_${ts}.csv`;
    fs.writeFileSync(path.join(process.cwd(), filename), res.data);
    spinner.succeed(chalk.green(`Exported to ${filename}`));
  } catch (err) { spinner.fail(err.message); }
}

module.exports = { list, get, search, create, exportProfiles };
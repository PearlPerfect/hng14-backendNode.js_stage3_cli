const Table = require('cli-table3');
const chalk = require('chalk');

function printTable(data) {
  if (!data || data.length === 0) {
    console.log(chalk.yellow('No results found.'));
    return;
  }
  const keys  = ['name', 'gender', 'age', 'age_group', 'country_id', 'country_name'];
  const table = new Table({
    head:  keys.map(k => chalk.cyan(k)),
    style: { head: [] },
  });
  data.forEach(row => table.push(keys.map(k => String(row[k] ?? ''))));
  console.log(table.toString());
}

function printProfile(profile) {
  if (!profile) { console.log(chalk.yellow('No profile data.')); return; }
  const table = new Table({ style: { head: [] } });
  Object.entries(profile).forEach(([k, v]) => table.push([chalk.cyan(k), String(v ?? '')]));
  console.log(table.toString());
}

function printPagination({ page, limit, total, total_pages }) {
  console.log(chalk.gray(`\nPage ${page} of ${total_pages || '?'} · ${total} total · ${limit} per page`));
}

module.exports = { printTable, printProfile, printPagination };
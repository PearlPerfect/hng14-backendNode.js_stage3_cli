#!/usr/bin/env node
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { program } = require('commander');
const authCmds    = require('../src/commands/auth');
const profileCmds = require('../src/commands/profiles');

program.name('insighta').description('Insighta Labs CLI').version('1.0.0');

// Auth commands
program.command('login').description('Log in with GitHub').action(authCmds.login);
program.command('logout').description('Log out').action(authCmds.logout);
program.command('whoami').description('Show current user').action(authCmds.whoami);

// Profiles command group
const profiles = program.command('profiles').description('Manage profiles');

profiles.command('list')
  .description('List profiles')
  .option('--gender <gender>', 'Filter by gender')
  .option('--country <code>', 'Filter by country code')
  .option('--age-group <group>', 'Filter by age group')
  .option('--min-age <n>', 'Minimum age')
  .option('--max-age <n>', 'Maximum age')
  .option('--sort-by <field>', 'Sort field: age | created_at | gender_probability')
  .option('--order <dir>', 'Sort order: asc | desc')
  .option('--page <n>', 'Page number')
  .option('--limit <n>', 'Results per page')
  .action(profileCmds.list);

profiles.command('get <id>').description('Get a profile by ID').action(profileCmds.get);

profiles.command('search <query>')
  .description('Natural language search')
  .option('--page <n>', 'Page number')
  .option('--limit <n>', 'Results per page')
  .action(profileCmds.search);

profiles.command('create')
  .description('Create a new profile (admin only)')
  .option('--name <name>', 'Profile name')
  .action(profileCmds.create);

profiles.command('export')
  .description('Export profiles as CSV')
  .option('--format <fmt>', 'Format: csv', 'csv')
  .option('--gender <gender>', 'Filter by gender')
  .option('--country <code>', 'Filter by country code')
  .action(profileCmds.exportProfiles);

program.parse(process.argv);
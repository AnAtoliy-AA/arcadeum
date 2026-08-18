#!/usr/bin/env node

/**
 * Cross-platform helper that resolves a port and runs a command.
 * Replaces $(node resolve-env-port.js ...) which is bash-specific and breaks on Windows cmd.exe.
 *
 * Usage: node run-with-port.js <envFile> <varName> <defaultPort> -- <command> [args...]
 *
 * Example:
 *   node run-with-port.js .env STORYBOOK_PORT 6007 -- storybook dev --no-open
 *   node run-with-port.js .env.local WEB_PORT 3000 -- next dev
 */

const { execSync } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const separatorIndex = args.indexOf('--');

if (separatorIndex === -1) {
  console.error('Usage: run-with-port.js <envFile> <varName> <defaultPort> -- <command> [args...]');
  process.exit(1);
}

const portArgs = args.slice(0, separatorIndex);
const command = args.slice(separatorIndex + 1).join(' ');

const resolveScript = path.join(__dirname, 'resolve-env-port.js');
const port = execSync(`node "${resolveScript}" ${portArgs.join(' ')}`, {
  encoding: 'utf8',
  stdio: ['pipe', 'pipe', 'pipe'],
}).trim();

execSync(`${command} -p ${port}`, { stdio: 'inherit', shell: true });

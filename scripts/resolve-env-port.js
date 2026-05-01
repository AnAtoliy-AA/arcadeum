#!/usr/bin/env node

/**
 * Shared utility to resolve development server ports using the 'dotenv' package's parse method.
 * Priorities:
 * 1. Process environment specific variable (e.g., WEB_PORT)
 * 2. Process environment generic variable (PORT)
 * 3. Local environment file specific variable (e.g., WEB_PORT)
 * 4. Local environment file generic variable (PORT)
 * 5. Default port
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const [envFile, varName, defaultPort = '3000'] = process.argv.slice(2);

function resolvePort() {
  // 1. Check process environment for specific variable (shell overrides)
  if (process.env[varName]) return process.env[varName].toString();
  if (process.env.PORT) return process.env.PORT.toString();

  // 2. Load from local environment file parsing using dotenv.parse
  if (envFile) {
    const envPath = path.resolve(process.cwd(), envFile);
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf8');
        const parsed = dotenv.parse(content);

        // Look for the specific variable (e.g. WEB_PORT=3500)
        if (parsed[varName]) return parsed[varName];

        // Look for the generic PORT variable
        if (parsed.PORT) return parsed.PORT;
      } catch (err) {
        // Fallback to default on read error
      }
    }
  }

  // 3. Fallback to default port
  return defaultPort;
}

process.stdout.write(resolvePort().toString());

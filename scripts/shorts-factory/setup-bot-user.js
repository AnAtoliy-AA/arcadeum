#!/usr/bin/env node

/**
 * Shorts Factory — Bot User Setup
 *
 * Registers a dedicated bot user on the Arcadeum backend and obtains
 * access/refresh tokens for use by the shorts factory pipelines.
 *
 * Writes SHORTS_FACTORY_BOT_TOKEN and SHORTS_FACTORY_BOT_REFRESH_TOKEN
 * to the project root .env file (idempotent — skips if already set).
 *
 * Usage:
 *   node scripts/shorts-factory/setup-bot-user.js
 *
 * Requirements:
 *   - Backend running at BE_URL (default http://localhost:4000)
 *   - .env file in project root
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rootDir = path.join(__dirname, '..', '..');

// Load env
require('dotenv').config({ path: path.join(rootDir, '.env') });
require('dotenv').config({ path: path.join(rootDir, '.env.local') });

const BE_URL =
  process.env.BE_URL || process.env.BACKEND_URL || 'http://localhost:4000';

const BOT_EMAIL =
  process.env.SHORTS_FACTORY_BOT_EMAIL || 'arcadeum-factory-bot@test.com';
const BOT_USERNAME =
  process.env.SHORTS_FACTORY_BOT_USERNAME || 'arcadeum_factory';
const BOT_PASSWORD = process.env.SHORTS_FACTORY_BOT_PASSWORD;

function log(level, msg, data) {
  const ts = new Date().toISOString();
  const prefix = `[${ts}] [${level.toUpperCase()}]`;
  if (data) {
    console.log(`${prefix} ${msg}`, JSON.stringify(data, null, 2));
  } else {
    console.log(`${prefix} ${msg}`);
  }
}

async function checkBackend() {
  try {
    const res = await axios.get(`${BE_URL}/health`, { timeout: 5000 });
    log('info', `Backend is alive at ${BE_URL} (status: ${res.status})`);
    return true;
  } catch (err) {
    // Health endpoint might not exist, try a lightweight GET
    try {
      await axios.get(`${BE_URL}`, { timeout: 5000 });
      log('info', `Backend is reachable at ${BE_URL}`);
      return true;
    } catch {
      log('error', `Cannot reach backend at ${BE_URL}`, {
        hint: 'Make sure the backend is running (pnpm dev:be or similar)',
      });
      return false;
    }
  }
}

async function registerBot() {
  log('info', `Registering bot user: ${BOT_EMAIL}`);
  try {
    const res = await axios.post(
      `${BE_URL}/auth/register`,
      {
        email: BOT_EMAIL,
        password: BOT_PASSWORD,
        username: BOT_USERNAME,
      },
      { timeout: 15000 },
    );
    log('info', 'Bot user registered successfully', {
      userId: res.data?.user?.id || res.data?.userId,
    });
    return true;
  } catch (err) {
    if (err.response?.status === 409) {
      log('info', 'Bot user already exists, proceeding to login');
      return true;
    }
    log('error', 'Registration failed', {
      status: err.response?.status,
      message: err.response?.data?.message || err.message,
    });
    return false;
  }
}

async function loginBot() {
  log('info', `Logging in as bot user: ${BOT_EMAIL}`);
  try {
    const res = await axios.post(
      `${BE_URL}/auth/login`,
      {
        email: BOT_EMAIL,
        password: BOT_PASSWORD,
      },
      { timeout: 15000 },
    );

    const { accessToken, refreshToken, user } = res.data || {};

    if (!accessToken) {
      log('error', 'Login succeeded but no accessToken in response', {
        keys: Object.keys(res.data || {}),
      });
      return null;
    }

    log('info', 'Login successful', {
      userId: user?.id,
      username: user?.username,
      accessTokenLength: accessToken.length,
      refreshTokenLength: refreshToken?.length || 0,
    });

    return { accessToken, refreshToken };
  } catch (err) {
    log('error', 'Login failed', {
      status: err.response?.status,
      message: err.response?.data?.message || err.message,
    });
    return null;
  }
}

function updateEnvFile(tokens) {
  const envPath = path.join(rootDir, '.env');
  let envContent = '';

  try {
    envContent = fs.readFileSync(envPath, 'utf8');
  } catch {
    log('warn', '.env file not found, creating new one');
  }

  const lines = envContent.split('\n');
  const updates = {
    SHORTS_FACTORY_BOT_TOKEN: tokens.accessToken,
    SHORTS_FACTORY_BOT_REFRESH_TOKEN: tokens.refreshToken || '',
  };

  for (const [key, value] of Object.entries(updates)) {
    const existingIdx = lines.findIndex((line) => line.startsWith(`${key}=`));
    if (existingIdx >= 0) {
      lines[existingIdx] = `${key}=${value}`;
      log('info', `Updated ${key} in .env`);
    } else {
      // Find a good place to insert — after SHORTS_FACTORY vars or at end
      const lastShortsIdx = lines.findLastIndex((line) =>
        line.startsWith('SHORTS_FACTORY'),
      );
      const insertIdx = lastShortsIdx >= 0 ? lastShortsIdx + 1 : lines.length;
      lines.splice(insertIdx, 0, `${key}=${value}`);
      log('info', `Added ${key} to .env`);
    }
  }

  // Ensure trailing newline
  const content = lines.join('\n');
  if (!content.endsWith('\n')) {
    fs.writeFileSync(envPath, content + '\n');
  } else {
    fs.writeFileSync(envPath, content);
  }

  log('info', '.env file updated');
}

function isAlreadyConfigured() {
  const envPath = path.join(rootDir, '.env');
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    const hasToken = content.includes('SHORTS_FACTORY_BOT_TOKEN=');
    const hasRefresh = content.includes('SHORTS_FACTORY_BOT_REFRESH_TOKEN=');
    // Check if they have actual values (not empty)
    const tokenMatch = content.match(/SHORTS_FACTORY_BOT_TOKEN=(.+)/);
    const hasRealToken = tokenMatch && tokenMatch[1].trim().length > 0;
    return hasRealToken;
  } catch {
    return false;
  }
}

async function main() {
  console.log('\n🔧 Shorts Factory — Bot User Setup\n');

  if (!BOT_PASSWORD) {
    log('error', 'SHORTS_FACTORY_BOT_PASSWORD not set in env', {
      hint: 'Add SHORTS_FACTORY_BOT_PASSWORD=<your-password> to .env',
    });
    process.exit(1);
  }

  if (isAlreadyConfigured()) {
    log('info', 'SHORTS_FACTORY_BOT_TOKEN is already configured in .env');
    log('info', 'Delete the token from .env and re-run to refresh it');
    process.exit(0);
  }

  // Step 1: Check backend
  const alive = await checkBackend();
  if (!alive) {
    process.exit(1);
  }

  // Step 2: Register
  const registered = await registerBot();
  if (!registered) {
    process.exit(1);
  }

  // Step 3: Login
  const tokens = await loginBot();
  if (!tokens) {
    process.exit(1);
  }

  // Step 4: Update .env
  updateEnvFile(tokens);

  console.log('\n✅ Setup complete!');
  console.log('   Bot user: ' + BOT_EMAIL);
  console.log('   Tokens written to .env');
  console.log(
    '\n   You can now run the shorts factory with authenticated gameplay:',
  );
  console.log('   node scripts/shorts-factory/daily-runner.js --preview\n');
}

main().catch((err) => {
  log('error', 'Unexpected error', { message: err.message, stack: err.stack });
  process.exit(1);
});

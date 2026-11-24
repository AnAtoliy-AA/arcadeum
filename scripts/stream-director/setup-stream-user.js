#!/usr/bin/env node
'use strict';

/**
 * Stream user setup: registers (if needed) and verifies login for the
 * dedicated live account, e.g. "arcadeum_live". The director logs in with the
 * same credentials at runtime, so NOTHING is written to disk by this script.
 *
 * Env (never commit values):
 *   STREAM_BOT_PASSWORD  required, choose a strong unique password
 *   STREAM_BOT_EMAIL     default arcadeum-live@test.com
 *   STREAM_BOT_USERNAME  default arcadeum_live
 *   STREAM_BE_URL        default http://localhost:4000
 *
 * Usage: STREAM_BOT_PASSWORD=... node scripts/stream-director/setup-stream-user.js
 */

const be = (
  process.env.STREAM_BE_URL ||
  process.env.BE_URL ||
  'http://localhost:4000'
).replace(/\/+$/, '');
const email = process.env.STREAM_BOT_EMAIL || 'arcadeum-live@test.com';
const username = process.env.STREAM_BOT_USERNAME || 'arcadeum_live';
const password = process.env.STREAM_BOT_PASSWORD;

async function post(path, body) {
  const res = await fetch(`${be}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* no body */
  }
  return { status: res.status, ok: res.ok, data };
}

async function main() {
  if (!password) {
    console.error(
      'STREAM_BOT_PASSWORD is not set. Export it (do not commit it) and retry.',
    );
    process.exit(1);
  }
  const reg = await post('/auth/register', { email, password, username });
  if (reg.ok) console.log(`registered ${username} <${email}>`);
  else if (reg.status === 409)
    console.log('user already exists, verifying login');
  else {
    console.error(
      `registration failed: HTTP ${reg.status} ${reg.data?.message || ''}`,
    );
    process.exit(1);
  }
  const login = await post('/auth/login', { email, password });
  if (!login.ok || !login.data?.accessToken) {
    console.error(
      `login failed: HTTP ${login.status} ${login.data?.message || ''}`,
    );
    console.error(
      'If the account needs email verification, verify it in the BE/admin first.',
    );
    process.exit(1);
  }
  console.log(
    'login OK. Put STREAM_BOT_EMAIL / STREAM_BOT_PASSWORD in the runner env file.',
  );
}

main().catch((err) => {
  console.error('unexpected error:', err.message);
  process.exit(1);
});

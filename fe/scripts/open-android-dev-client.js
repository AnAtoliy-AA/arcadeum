#!/usr/bin/env node
const { execSync, spawnSync } = require('child_process');

function getScheme() {
  if (process.env.APP_SCHEME) return process.env.APP_SCHEME;
  try {
    const out = execSync('npx --yes expo config --type public', { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
    const cfg = JSON.parse(out);
    return (cfg?.extra?.APP_SCHEME || cfg?.scheme || 'mobile');
  } catch (_e) {
    return 'mobile';
  }
}

function ensureAdbReverse() {
  try {
    execSync('adb reverse tcp:8081 tcp:8081', { stdio: 'ignore' });
  } catch (_e) {
    // ignore
  }
}

function openDevClient(scheme) {
  const url = `${scheme}://expo-development-client/?url=http://localhost:8081`;
  const args = ['shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-d', url];
  const res = spawnSync('adb', args, { stdio: 'inherit' });
  if (res.status !== 0) {
    console.error('Failed to open dev client via adb. Ensure the app is installed and the scheme is registered.');
    process.exit(res.status || 1);
  }
}

const scheme = getScheme();
console.log(`Using app scheme: ${scheme}`);
ensureAdbReverse();
openDevClient(scheme);

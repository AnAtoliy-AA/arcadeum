#!/usr/bin/env node
const { execSync, spawnSync } = require('child_process');

function getScheme() {
  if (process.env.APP_SCHEME) return process.env.APP_SCHEME;
  try {
    const out = execSync('npx --yes expo config --type public', { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
    const cfg = JSON.parse(out);
    return cfg?.extra?.APP_SCHEME || cfg?.scheme || 'mobile';
  } catch (_e) {
    return 'mobile';
  }
}

function getBootedSimulator() {
  try {
    const out = execSync('xcrun simctl list devices booted -j', { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
    const json = JSON.parse(out);
    const devices = json.devices || {};
    for (const runtime of Object.keys(devices)) {
      for (const d of devices[runtime] || []) {
        if (d.state === 'Booted') return d.udid;
      }
    }
    return null;
  } catch (_e) {
    return null;
  }
}

function openUrlOnBooted(url) {
  const res = spawnSync('xcrun', ['simctl', 'openurl', 'booted', url], { stdio: 'inherit' });
  if (res.status !== 0) {
    console.error('Failed to open URL in iOS Simulator. Is a simulator booted?');
    process.exit(res.status || 1);
  }
}

const scheme = getScheme();
const metroUrl = process.env.METRO_URL || 'http://localhost:8081';
const url = `${scheme}://expo-development-client/?url=${encodeURI(metroUrl)}`;

const booted = getBootedSimulator();
if (!booted) {
  console.error('No booted iOS Simulator found. Open Simulator first, then re-run this command.');
  process.exit(1);
}

console.log(`Using app scheme: ${scheme}`);
console.log(`Opening in iOS Simulator: ${url}`);
openUrlOnBooted(url);

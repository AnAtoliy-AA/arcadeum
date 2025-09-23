#!/usr/bin/env node
require('dotenv').config();
const { execSync } = require('child_process');

function exec(cmd) {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
  } catch (e) {
    const out = e.stdout ? e.stdout.toString() : '';
    const err = e.stderr ? e.stderr.toString() : e.message;
    return (out + (out && err ? '\n' : '') + err).trim();
  }
}

const bundleId = 'com.anonymous.mobile';
const clientId = process.env.AUTH_IOS_CLIENT_ID || '';
let scheme = process.env.AUTH_IOS_REDIRECT_SCHEME || '';

function deriveSchemeFromClientId(id) {
  if (!id) return '';
  return 'com.googleusercontent.apps.' + id.replace(/\.apps\.googleusercontent\.com$/, '');
}

if (!scheme && clientId) {
  scheme = deriveSchemeFromClientId(clientId);
}

if (!scheme) {
  console.error('Missing AUTH_IOS_REDIRECT_SCHEME (or AUTH_IOS_CLIENT_ID to derive it).');
  process.exit(1);
}

// Warn if scheme appears malformed (includes the domain suffix)
if (/\.apps\.googleusercontent\.com$/.test(scheme)) {
  console.warn('[warn] AUTH_IOS_REDIRECT_SCHEME looks incorrect. It should NOT include .apps.googleusercontent.com');
}

const uri = `${scheme}:/oauth2redirect/google`;

console.log('Booted simulators:\n' + exec('xcrun simctl list devices | grep Booted || true'));

// Ensure there is a booted device
const booted = exec('xcrun simctl list devices | grep -c Booted')
  .split('\n').pop();
if (!booted || parseInt(booted, 10) < 1) {
  console.error('No booted simulator found. Boot one in Xcode or run: xcrun simctl boot "iPhone 15"');
  process.exit(1);
}

console.log(`\nChecking installed app for ${bundleId} ...`);
const appPath = exec(`xcrun simctl get_app_container booted ${bundleId} app`);
if (!appPath || /No such file|Invalid/.test(appPath)) {
  console.error(`App ${bundleId} is not installed on the booted simulator. Build & run the app, then retry.`);
  process.exit(1);
}

console.log(`App container: ${appPath}`);

console.log('\nInspecting Info.plist URL types for redirect scheme...');
const plistPath = `${appPath}/Info.plist`;
const plist = exec(`plutil -p '${plistPath}' || true`);
let schemeFound = false;
if (plist) {
  const urlTypesBlock = exec(`plutil -extract CFBundleURLTypes xml1 -o - '${plistPath}' 2>/dev/null || true`);
  schemeFound = new RegExp(scheme.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(urlTypesBlock || plist);
  console.log(urlTypesBlock || plist);
} else {
  console.warn('[warn] Could not read Info.plist via plutil. Ensure Xcode command line tools are installed.');
}

console.log(`\nOpening redirect URI to test deep link: ${uri}`);
const openOut = exec(`xcrun simctl openurl booted '${uri}'`);
console.log(openOut || '(no output)');

console.log('\nSummary:');
if (!schemeFound) {
  console.log('- Scheme not found in CFBundleURLTypes.');
  console.log('- Ensure AUTH_IOS_REDIRECT_SCHEME is correct in fe/.env and rebuild (npm run ios).');
}
if (/Error|failed|does not/.test(openOut)) {
  console.log('- Deep link did NOT open the app. Fix the scheme and rebuild.');
} else {
  console.log('- Deep link invoked. If app foregrounds, redirect handling works.');
}

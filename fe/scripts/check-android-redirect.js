#!/usr/bin/env node
require('dotenv').config();
const { execSync } = require('child_process');

function exec(cmd) {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
  } catch (e) {
    return e.stdout ? e.stdout.toString() : e.message;
  }
}

const pkg = 'com.anonymous.mobile';
const clientId = process.env.AUTH_ANDROID_CLIENT_ID || '';
let scheme = process.env.AUTH_ANDROID_REDIRECT_SCHEME || '';
if (!scheme && clientId) {
  const idPart = clientId.replace(/\.apps\.googleusercontent\.com$/, '');
  scheme = `com.googleusercontent.apps.${idPart}`;
}

if (!scheme) {
  console.error('Missing AUTH_ANDROID_REDIRECT_SCHEME. Set it in fe/.env');
  process.exit(1);
}

const uri = `${scheme}:/oauth2redirect/google`;

console.log('Device list:\n' + exec('adb devices'));

const installed = exec(`adb shell pm list packages | grep ${pkg}`).includes(pkg);
if (!installed) {
  console.error(`Package ${pkg} is not installed. Install the APK then retry.`);
  process.exit(1);
}

console.log(`\nResolving activity for: ${uri}\n`);
const resolveOut = exec(
  `adb shell cmd package resolve-activity -d '${uri}' -a android.intent.action.VIEW`
);
console.log(resolveOut);

console.log(`\nInspecting installed manifest intent filters for ${pkg} (filtered by scheme)\n`);
const dumpsys = exec(
  `adb shell dumpsys package ${pkg} | sed -n '/intent filters/,+250p' | grep -i '${scheme}' -n || true`
);
console.log(dumpsys || '(no matches found)');

console.log('\nSummary:');
if (/ResolverActivity/.test(resolveOut) || !resolveOut) {
  console.log('- Redirect URI did NOT resolve to the app.');
  console.log('- Ensure your APK includes an intent-filter with android:scheme="' + scheme + '"');
  console.log('- Then clean + reinstall the app and re-run this script.');
} else {
  console.log('- Redirect URI resolves to your app. You can retry Google sign-in.');
}

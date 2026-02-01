#!/usr/bin/env node
const { execSync, spawnSync } = require('child_process');

function listDevices() {
  try {
    const output = execSync('adb devices', {
      stdio: ['ignore', 'pipe', 'ignore'],
    }).toString();
    return output
      .split('\n')
      .slice(1)
      .map((line) => line.trim().split('\t'))
      .filter(([serial, status]) => serial && status && status !== 'offline');
  } catch (_e) {
    return [];
  }
}

function pickDevice(devices) {
  const envSerial = process.env.ANDROID_SERIAL || process.env.ADB_DEVICE;
  if (envSerial) {
    if (devices.find(([serial]) => serial === envSerial)) {
      console.log(`[android:open] Using device from environment: ${envSerial}`);
      return envSerial;
    }
    console.warn(
      `[android:open] Environment device ${envSerial} not connected. Falling back to auto selection.`,
    );
  }
  if (!devices.length) {
    return null;
  }
  if (devices.length === 1) {
    const [serial] = devices[0];
    console.log(`[android:open] Using sole connected device: ${serial}`);
    return serial;
  }
  const emulator = devices.find(([serial]) => serial.startsWith('emulator-'));
  const chosen = emulator ? emulator[0] : devices[0][0];
  const list = devices.map(([serial]) => serial).join(', ');
  console.log(
    `[android:open] Multiple devices detected (${list}). Using ${chosen}. Set ANDROID_SERIAL to override.`,
  );
  return chosen;
}

function ensureDevice() {
  const devices = listDevices();
  const serial = pickDevice(devices);
  if (!serial) {
    console.error(
      'No Android devices or emulators detected. Connect one and try again.',
    );
    process.exit(1);
  }
  return serial;
}

function getScheme() {
  if (process.env.APP_SCHEME) return process.env.APP_SCHEME;
  try {
    const out = execSync('npx --yes expo config --type public', {
      stdio: ['ignore', 'pipe', 'ignore'],
    }).toString();
    const cfg = JSON.parse(out);
    return cfg?.extra?.APP_SCHEME || cfg?.scheme || 'mobile';
  } catch (_e) {
    return 'mobile';
  }
}

function ensureAdbReverse() {
  const serial = ensureDevice();
  try {
    execSync(`adb -s ${serial} reverse tcp:8081 tcp:8081`, { stdio: 'ignore' });
  } catch (error) {
    console.warn(
      `[android:open] Unable to set adb reverse for ${serial}:`,
      error.message,
    );
  }
  return serial;
}

function openDevClient(scheme, serial) {
  const url = `${scheme}://expo-development-client/?url=http://localhost:8081`;
  const args = [
    'shell',
    'am',
    'start',
    '-a',
    'android.intent.action.VIEW',
    '-d',
    url,
  ];
  const adbArgs = serial ? ['-s', serial, ...args] : args;
  const res = spawnSync('adb', adbArgs, { stdio: 'inherit' });
  if (res.status !== 0) {
    console.error(
      'Failed to open dev client via adb. Ensure the app is installed and the scheme is registered.',
    );
    process.exit(res.status || 1);
  }
}

const scheme = getScheme();
console.log(`Using app scheme: ${scheme}`);
const serial = ensureAdbReverse();
openDevClient(scheme, serial);

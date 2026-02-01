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
  } catch (error) {
    console.error(
      '[android:reverse] Failed to list connected Android devices.',
      error.message,
    );
    return [];
  }
}

function pickDevice(devices) {
  const envSerial = process.env.ANDROID_SERIAL || process.env.ADB_DEVICE;
  if (envSerial) {
    if (devices.find(([serial]) => serial === envSerial)) {
      console.log(
        `[android:reverse] Using device from environment: ${envSerial}`,
      );
      return envSerial;
    }
    console.warn(
      `[android:reverse] Environment device ${envSerial} not found among connected devices.`,
    );
  }
  if (devices.length === 0) {
    return null;
  }
  if (devices.length === 1) {
    const [serial] = devices[0];
    console.log(`[android:reverse] Using sole connected device: ${serial}`);
    return serial;
  }
  const emulator = devices.find(([serial]) => serial.startsWith('emulator-'));
  const chosen = emulator ? emulator[0] : devices[0][0];
  const list = devices.map(([serial]) => serial).join(', ');
  console.log(
    `[android:reverse] Multiple devices connected (${list}). Using ${chosen}. Set ANDROID_SERIAL to override.`,
  );
  return chosen;
}

function reversePort(serial) {
  const args = ['reverse', 'tcp:8081', 'tcp:8081'];
  const adbArgs = serial ? ['-s', serial, ...args] : args;
  const result = spawnSync('adb', adbArgs, { stdio: 'inherit' });
  if (result.status !== 0) {
    console.error('[android:reverse] Failed to configure adb reverse.');
    process.exit(result.status || 1);
  }
}

const devices = listDevices();
const serial = pickDevice(devices);
if (!serial) {
  console.error(
    '[android:reverse] No available Android devices or emulators detected.',
  );
  process.exit(1);
}
reversePort(serial);

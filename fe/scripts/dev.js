#!/usr/bin/env node
const { spawn } = require('child_process');
const http = require('http');

function parseTargets() {
  const args = process.argv.slice(2);
  const all = !args.length;
  return {
    android: all || args.includes('--android'),
    ios: all || args.includes('--ios'),
    web: all || args.includes('--web'),
  };
}

function waitForMetro(url = 'http://localhost:8081/status', timeoutMs = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    (function poll() {
      http
        .get(url, (res) => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 500) {
            resolve(true);
          } else {
            retry();
          }
        })
        .on('error', retry);
      function retry() {
        if (Date.now() - start > timeoutMs) return reject(new Error('Metro not responding'));
        setTimeout(poll, 1000);
      }
    })();
  });
}

function runNpm(cmd, args = []) {
  return spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', cmd, ...args], {
    stdio: 'inherit',
    shell: true,
  });
}

function runExpoStart({ web } = { web: false }) {
  const bin = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const args = ['--yes', 'expo', 'start', '--host', 'localhost'];
  if (web) args.push('--web');
  return spawn(bin, args, { stdio: 'inherit', shell: true });
}

async function main() {
  const targets = parseTargets();

  // Start Expo dev server (with web if requested)
  const metro = runExpoStart({ web: targets.web });

  // Cleanup on exit
  const clean = () => {
    try { metro.kill('SIGINT'); } catch {}
  };
  process.on('SIGINT', () => { clean(); process.exit(0); });
  process.on('SIGTERM', () => { clean(); process.exit(0); });

  // Wait for Metro to respond
  try {
    await waitForMetro();
    console.log('Metro is responding. Launching targets...');
  } catch (_e) {
    console.warn('Metro did not respond in time, continuing anyway...');
  }

  const procs = [];

  if (targets.android) {
    // Install and open in parallel (install may no-op if already installed)
    const p = runNpm('android');
    procs.push(p);
  }

  if (targets.ios) {
    // Build/run iOS then open URL
    const iosBuild = runNpm('ios');
    iosBuild.on('close', () => {
      runNpm('ios:open');
    });
    procs.push(iosBuild);
  }

  // Keep process alive while children run
  procs.forEach((p) => p.on('exit', (code) => console.log(`[child exited] code=${code}`)));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

#!/usr/bin/env node
const { spawn } = require('child_process');
const http = require('http');

function parseTargets() {
  const args = process.argv.slice(2);
  // Default: run all three (web, android, ios) unless user specifies subset flags
  const all = !args.length;
  const noDevClient = args.includes('--no-dev-client');
  return {
    android: all || args.includes('--android'),
    ios: all || args.includes('--ios'),
    web: all || args.includes('--web'),
    noDevClient,
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
        if (Date.now() - start > timeoutMs)
          return reject(new Error('Metro not responding'));
        setTimeout(poll, 1000);
      }
    })();
  });
}

function runNpm(cmd, args = []) {
  return spawn(
    process.platform === 'win32' ? 'npm.cmd' : 'npm',
    ['run', cmd, ...args],
    {
      stdio: 'inherit',
      shell: true,
    },
  );
}

function runExpoStart(
  { web, noDevClient, forceNoDevClient } = {
    web: false,
    noDevClient: false,
    forceNoDevClient: false,
  },
) {
  const bin = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const args = ['--yes', 'expo', 'start', '--host', 'localhost'];
  const usingDevClient = !noDevClient && !forceNoDevClient;
  if (usingDevClient) args.push('--dev-client');
  if (web) args.push('--web');
  console.log('[dev] expo command:', bin, args.join(' '));
  console.log(
    '[dev] Flags => web:',
    web,
    ' dev-client:',
    usingDevClient,
    ' (suppressed due to web?:',
    forceNoDevClient,
    ')',
  );
  return spawn(bin, args, { stdio: 'inherit', shell: true });
}

async function main() {
  const targets = parseTargets();

  // Force NODE_ENV=development if not set, so libraries relying on it behave as expected.
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
    console.log('Set NODE_ENV=development');
  }
  // If web is present, suppress dev-client so web debugging (Chrome Sources) remains clean.
  // Users can still force dev-client by omitting web or editing this script.
  const forceNoDevClient = targets.web;

  console.log(
    `[dev] Launching targets: web=${targets.web} android=${targets.android} ios=${targets.ios}`,
  );
  console.log('[dev] NODE_ENV =', process.env.NODE_ENV);
  console.log('[dev] Args =', process.argv.slice(2).join(' ') || '(none)');
  if (forceNoDevClient) {
    console.log(
      '[dev] Web detected -> skipping --dev-client for better Chrome source maps.',
    );
  } else if (!targets.noDevClient) {
    console.log(
      '[dev] Using dev-client mode (native). Pass --no-dev-client to disable.',
    );
  }

  // Start Expo dev server (with web if requested)
  const metro = runExpoStart({
    web: targets.web,
    noDevClient: targets.noDevClient || forceNoDevClient,
    forceNoDevClient,
  });

  // Cleanup on exit
  const clean = () => {
    try {
      metro.kill('SIGINT');
    } catch {}
  };
  process.on('SIGINT', () => {
    clean();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    clean();
    process.exit(0);
  });

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
  procs.forEach((p) =>
    p.on('exit', (code) => console.log(`[child exited] code=${code}`)),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

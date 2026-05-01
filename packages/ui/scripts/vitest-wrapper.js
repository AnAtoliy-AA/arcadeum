#!/usr/bin/env node
const { spawnSync } = require('child_process');

/**
 * Filter out Jest-specific flags that Vitest doesn't support.
 */
const incompatibleFlags = ['--forceExit', '--detectOpenHandles'];
const args = process.argv.slice(2);
const filteredArgs = args.filter((arg) => !incompatibleFlags.includes(arg));

const result = spawnSync('pnpm', ['exec', 'vitest', 'run', ...filteredArgs], {
  stdio: 'inherit',
  shell: true,
});

process.exit(result.status ?? 0);

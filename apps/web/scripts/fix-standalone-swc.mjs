#!/usr/bin/env node
// Next.js standalone + pnpm workaround.
//
// node-file-trace only copies the `cjs/` half of `@swc/helpers` into the
// standalone output because Next's require-hook loads the `esm/` entrypoints
// dynamically at runtime. On boot the standalone server then crashes with
// `MODULE_NOT_FOUND: .../@swc/helpers/esm/_interop_require_default.js`.
//
// This script copies the missing `esm/` directory into the standalone's pnpm
// store (the location Next resolves `@swc/helpers` from via its symlink).
// It runs as the `postbuild` step, so it only affects standalone builds;
// Vercel (no standalone output) is a no-op.

import { cpSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const standaloneRoot = join(appRoot, '.next', 'standalone');

if (!existsSync(standaloneRoot)) {
  process.exit(0);
}

// In a pnpm workspace the shared store lives at the repo root
// (`<root>/node_modules/.pnpm`), not inside the app. Walk up until we find it.
const findWorkspacePnpmDir = (startDir) => {
  let dir = startDir;
  for (let i = 0; i < 6; i++) {
    const candidate = join(dir, 'node_modules', '.pnpm');
    if (existsSync(candidate)) return candidate;
    const parent = join(dir, '..');
    if (parent === dir) return null;
    dir = parent;
  }
  return null;
};

const findHelperStores = (pnpmDir) => {
  if (!pnpmDir || !existsSync(pnpmDir)) return [];
  return readdirSync(pnpmDir)
    .filter((entry) => entry.startsWith('@swc+helpers@'))
    .map((entry) => join(pnpmDir, entry, 'node_modules', '@swc', 'helpers'));
};

const sourceStores = findHelperStores(findWorkspacePnpmDir(appRoot));
const targetStores = [
  ...findHelperStores(join(standaloneRoot, 'node_modules', '.pnpm')),
  // App-local node_modules in the standalone (some layouts resolve here).
  join(standaloneRoot, 'apps', 'web', 'node_modules', '@swc', 'helpers'),
];

let copied = 0;
for (const source of sourceStores) {
  const esmSource = join(source, 'esm');
  if (!existsSync(esmSource)) continue;
  for (const target of targetStores) {
    const esmTarget = join(target, 'esm');
    if (existsSync(esmTarget) || !existsSync(target)) continue;
    cpSync(esmSource, esmTarget, { recursive: true });
    copied += 1;
  }
}

if (copied > 0) {
  console.log(
    `[fix-standalone-swc] copied @swc/helpers/esm into ${copied} standalone location(s)`,
  );
}
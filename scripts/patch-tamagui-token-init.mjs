/**
 * Patches all copies of @tamagui/web's config.mjs to auto-initialize
 * tokensMerged from globalThis.__tamaguiConfig when createTamagui()
 * was not called on that particular module instance.
 *
 * WHY: pnpm creates multiple physical copies of @tamagui/web with
 * different peer-dep hashes. The vitest setup file calls createTamagui()
 * which sets tokensMerged via setTokens() on ONE copy, but components
 * (via @tamagui/button) may resolve to a DIFFERENT copy where
 * tokensMerged is still undefined, causing:
 *   TypeError: Cannot convert undefined or null to object
 *     at Object.keys (tokensMerged)
 *
 * This patch adds a self-initializing fallback: when getTokenObject()
 * encounters a missing tokensMerged, it builds one from the global
 * config that the setup file already placed on globalThis.__tamaguiConfig.
 */

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const PATCH_MARKER = '/* __tamagui-token-init-patch__ */';

const PATCH_CODE = `
  // --- BEGIN tamagui token-init patch ---
  // Auto-initialize tokensMerged from globalThis.__tamaguiConfig when
  // createTamagui() was not called on this @tamagui/web instance.
  if (!tokensMerged && typeof globalThis !== 'undefined') {
    var _gTC = globalThis.__tamaguiConfig;
    if (_gTC && _gTC.tokens) {
      tokensMerged = {};
      for (var _cat in _gTC.tokens) {
        tokensMerged[_cat] = {};
        for (var _k in _gTC.tokens[_cat]) {
          var _v = _gTC.tokens[_cat][_k];
          tokensMerged[_cat]['$' + _k] = _v;
          tokensMerged[_cat][_k] = _v;
        }
      }
    }
  }
  // --- END tamagui token-init patch ---`;

function findTamaguiWebConfigs() {
  const pnpmDir = join(process.cwd(), 'node_modules', '.pnpm');
  const results = [];
  if (!existsSync(pnpmDir)) return results;

  for (const entry of readdirSync(pnpmDir)) {
    if (!entry.startsWith('@tamagui+web@')) continue;
    const configPath = join(
      pnpmDir,
      entry,
      'node_modules',
      '@tamagui',
      'web',
      'dist',
      'esm',
      'config.mjs',
    );
    if (existsSync(configPath)) results.push(configPath);
  }
  return results;
}

let patched = 0;
for (const configPath of findTamaguiWebConfigs()) {
  const src = readFileSync(configPath, 'utf8');
  if (src.includes(PATCH_MARKER)) continue;

  // Insert the patch right after `let tokensMerged;`
  const marker = 'let tokensMerged;';
  const idx = src.indexOf(marker);
  if (idx === -1) {
    console.warn(`[patch-tamagui] Could not find "let tokensMerged;" in ${configPath}`);
    continue;
  }

  const patched_src =
    src.slice(0, idx + marker.length) +
    PATCH_CODE +
    src.slice(idx + marker.length);

  writeFileSync(configPath, patched_src, 'utf8');
  patched++;
}

if (patched > 0) {
  console.log(`[patch-tamagui] Patched ${patched} config.mjs file(s) for token auto-init`);
} else {
  console.log('[patch-tamagui] No files to patch (already patched or not found)');
}

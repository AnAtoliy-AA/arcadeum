import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const BUILD_ID_FILE = path.join(ROOT, '.next', 'BUILD_ID');
const OUT_FILE = path.join(ROOT, 'public', 'build-id.json');

/**
 * Emits public/build-id.json so the offline-downloads feature (ARC-900 follow-up)
 * can detect new deployments and silently refresh cached game bundles.
 */
async function main() {
  try {
    const buildId = (await readFile(BUILD_ID_FILE, 'utf8')).trim();
    if (!buildId) throw new Error('empty BUILD_ID');
    await writeFile(OUT_FILE, `${JSON.stringify({ buildId })}\n`, 'utf8');
    console.log(`[generate-build-id] wrote ${OUT_FILE} (${buildId})`);
  } catch (error) {
    // Non-fatal: the client treats a missing build-id.json as "unknown build".
    console.warn(
      '[generate-build-id] skipped — .next/BUILD_ID not found. Run after `next build`.',
      error instanceof Error ? error.message : error,
    );
  }
}

void main();

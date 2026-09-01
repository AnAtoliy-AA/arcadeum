import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

declare global {
  var __arcadeumMongoReplSet: MongoMemoryReplSet | undefined;
  var __arcadeumMongoSignalsRegistered: boolean | undefined;
}

function registerCleanupSignals(): void {
  if (globalThis.__arcadeumMongoSignalsRegistered) return;
  globalThis.__arcadeumMongoSignalsRegistered = true;

  // Playwright runs globalTeardown on a clean exit, but not when the runner
  // is interrupted (Ctrl+C / SIGTERM). Without these handlers the spawned
  // mongod children survive as orphans. We stop the replset best-effort and
  // re-raise the signal so Playwright's own handlers still fire and the
  // process exits with the expected code.
  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => {
      const replSet = globalThis.__arcadeumMongoReplSet;
      globalThis.__arcadeumMongoReplSet = undefined;
      const done = replSet
        ? replSet.stop({ force: true, doCleanup: true }).catch(() => undefined)
        : Promise.resolve();
      void done.finally(() => {
        // Re-emit the signal so any other listeners (Playwright runner) get
        // a chance to clean up too. We removed our own listener via .once,
        // so this won't recurse.
        process.kill(process.pid, signal);
      });
    });
  }
}

export default async function globalSetup(): Promise<void> {
  // Generate placeholder offline-download manifests so the dev server
  // doesn't log 404 noise for /game-sizes.json and /build-id.json on
  // every page load.  The real files are produced by `postbuild` and
  // gitignored; during e2e the dev server never runs `next build`.
  const webRoot = process.cwd();
  await Promise.all([
    writeFile(
      join(webRoot, 'public', 'build-id.json'),
      JSON.stringify({ buildId: 'e2e-placeholder' }) + '\n',
    ),
    writeFile(
      join(webRoot, 'public', 'game-sizes.json'),
      JSON.stringify({ games: {}, totalBytes: 0 }) + '\n',
    ),
  ]);

  // Honor an external MONGODB_OCI_URI so a developer pointing at a local mongod —
  // or a CI service container — wins over the throwaway replset.
  if (process.env.MONGODB_OCI_URI) {
    return;
  }

  // Match BE integration tests (apps/be/src/**/*.integration-spec.ts).
  // A single-node replset is enough to satisfy Mongoose transactions.
  const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  globalThis.__arcadeumMongoReplSet = replSet;
  // Child webServer processes inherit process.env, so removing the
  // MONGODB_OCI_URI line from playwright.config.ts's webServer.env lets the BE
  // pick this up at spawn time.
  process.env.MONGODB_OCI_URI = replSet.getUri();

  registerCleanupSignals();
}

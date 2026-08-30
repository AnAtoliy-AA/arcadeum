import { writeFile, mkdir } from 'node:fs/promises';
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

async function writePlaceholderFiles(dir: string): Promise<void> {
  await Promise.all([
    writeFile(
      join(dir, 'build-id.json'),
      JSON.stringify({ buildId: 'e2e-placeholder' }) + '\n',
    ),
    writeFile(
      join(dir, 'game-sizes.json'),
      JSON.stringify({ games: {}, totalBytes: 0 }) + '\n',
    ),
  ]);
}

export default async function globalSetup(): Promise<void> {
  // Generate placeholder offline-download manifests so the server
  // doesn't log 404 noise for /game-sizes.json and /build-id.json on
  // every page load.  The real files are produced by `postbuild` and
  // gitignored; during e2e the server never runs `next build`.
  //
  // In dev mode (`next dev`), static files are served from `public/`.
  // In CI production mode (`next start` with `output: 'standalone'`),
  // the standalone server serves from `.next/standalone/public/` which
  // is NOT included in the build-artifacts tar.  Write to both so the
  // 404s disappear regardless of which server is running.
  const webRoot = process.cwd();
  await writePlaceholderFiles(join(webRoot, 'public'));

  // `.next/standalone/public/` doesn't exist after `next build` —
  // the OCI deploy workflow copies it, but e2e doesn't.  Create it
  // so the standalone server can find the placeholders.
  const standalonePublic = join(webRoot, '.next', 'standalone', 'public');
  await mkdir(standalonePublic, { recursive: true });
  await writePlaceholderFiles(standalonePublic);

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

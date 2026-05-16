import { MongoMemoryReplSet } from 'mongodb-memory-server';

declare global {
  var __arcadeumMongoReplSet: MongoMemoryReplSet | undefined;
}

export default async function globalSetup(): Promise<void> {
  // Honor an external MONGODB_URI so a developer pointing at a local mongod —
  // or a CI service container — wins over the throwaway replset.
  if (process.env.MONGODB_URI) {
    return;
  }

  // Match BE integration tests (apps/be/src/**/*.integration-spec.ts).
  // A single-node replset is enough to satisfy Mongoose transactions.
  const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  globalThis.__arcadeumMongoReplSet = replSet;
  // Child webServer processes inherit process.env, so removing the
  // MONGODB_URI line from playwright.config.ts's webServer.env lets the BE
  // pick this up at spawn time.
  process.env.MONGODB_URI = replSet.getUri();
}

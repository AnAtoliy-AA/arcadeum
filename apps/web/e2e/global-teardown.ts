import type { MongoMemoryReplSet } from 'mongodb-memory-server';

declare global {
  var __arcadeumMongoReplSet: MongoMemoryReplSet | undefined;
}

export default async function globalTeardown(): Promise<void> {
  const replSet = globalThis.__arcadeumMongoReplSet;
  if (!replSet) {
    return;
  }
  globalThis.__arcadeumMongoReplSet = undefined;
  await replSet.stop();
}

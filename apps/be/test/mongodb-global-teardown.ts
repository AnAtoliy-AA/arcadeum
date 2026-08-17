import { rmSync } from 'fs';
import { SHARED_MONGO_URI_FILE, stopSharedMongo } from './integration-helpers';

/** Jest globalTeardown: stops the shared mongod started in globalSetup. */
export default async function globalTeardown(): Promise<void> {
  await stopSharedMongo();
  rmSync(SHARED_MONGO_URI_FILE, { force: true });
}

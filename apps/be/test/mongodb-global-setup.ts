import { writeFileSync } from 'fs';
import { SHARED_MONGO_URI_FILE, startSharedMongo } from './integration-helpers';

/**
 * Jest globalSetup: starts ONE mongod shared by all integration specs.
 * The URI is persisted to a temp file because jest workers are separate
 * processes and cannot read env vars set here.
 */
export default async function globalSetup(): Promise<void> {
  writeFileSync(SHARED_MONGO_URI_FILE, await startSharedMongo(), 'utf8');
}

import { SecureStoreShim } from './secureStore';

const ANON_ID_KEY = 'aico_anon_id';

/**
 * Gets the persisted anonymous ID or generates a new one if it doesn't exist.
 */
export async function getAnonymousId(): Promise<string> {
  let id = await SecureStoreShim.getItemAsync(ANON_ID_KEY);

  if (!id) {
    id = `anon_${Math.random().toString(36).substring(2, 10)}`;
    await SecureStoreShim.setItemAsync(ANON_ID_KEY, id);
  }

  return id;
}

/**
 * Gets the current anonymous ID without generating a new one.
 */
export async function peekAnonymousId(): Promise<string | null> {
  return SecureStoreShim.getItemAsync(ANON_ID_KEY);
}

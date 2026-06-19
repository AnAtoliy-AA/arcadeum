import { Keypair } from '@solana/web3.js';

let cachedKeypair: Keypair | null = null;

/**
 * Load the platform wallet keypair from a JSON-encoded secret key string.
 * The string should contain a JSON array of 64 numbers (the secret key).
 */
export function getPlatformKeypair(secretKeyJson: string): Keypair {
  if (cachedKeypair) return cachedKeypair;

  if (!secretKeyJson) {
    throw new Error(
      'SOLANA_PRIVATE_KEY environment variable is not set. ' +
        'Generate a keypair and set it as a JSON array of 64 numbers.',
    );
  }

  try {
    const parsed: number[] = JSON.parse(secretKeyJson) as number[];
    const secretKey = Uint8Array.from(parsed);
    cachedKeypair = Keypair.fromSecretKey(secretKey);
    return cachedKeypair;
  } catch {
    throw new Error(
      'SOLANA_PRIVATE_KEY is invalid. Expected a JSON array of 64 numbers.',
    );
  }
}

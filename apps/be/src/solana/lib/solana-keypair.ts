import { Keypair } from '@solana/web3.js';

let cachedKeypair: Keypair | null = null;

/**
 * Load the platform wallet keypair from SOLANA_PRIVATE_KEY env var.
 * The env var should contain a JSON array of 64 numbers (the secret key).
 */
export function getPlatformKeypair(): Keypair {
  if (cachedKeypair) return cachedKeypair;

  const raw = process.env.SOLANA_PRIVATE_KEY;
  if (!raw) {
    throw new Error(
      'SOLANA_PRIVATE_KEY environment variable is not set. ' +
        'Generate a keypair and set it as a JSON array of 64 numbers.',
    );
  }

  try {
    const parsed: number[] = JSON.parse(raw) as number[];
    const secretKey = Uint8Array.from(parsed);
    cachedKeypair = Keypair.fromSecretKey(secretKey);
    return cachedKeypair;
  } catch {
    throw new Error(
      'SOLANA_PRIVATE_KEY is invalid. Expected a JSON array of 64 numbers.',
    );
  }
}

import type { Keypair } from '@solana/web3.js';

let cachedKeypair: Keypair | null = null;

const BASE58_ALPHABET =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58Decode(str: string): Uint8Array {
  let result = BigInt(0);
  for (const char of str) {
    const index = BASE58_ALPHABET.indexOf(char);
    if (index === -1) throw new Error(`Invalid base58 character: ${char}`);
    result = result * BigInt(58) + BigInt(index);
  }

  const hex = result.toString(16);
  const paddedHex = hex.length % 2 === 0 ? hex : '0' + hex;
  const bytes = new Uint8Array(paddedHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(paddedHex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Load the platform wallet keypair.
 * Accepts either:
 *   - A base58-encoded secret key string (88 chars for 64-byte key)
 *   - A JSON array of 64 numbers
 */
export async function getPlatformKeypair(
  secretKeyJson: string,
): Promise<Keypair> {
  if (cachedKeypair) return cachedKeypair;

  if (!secretKeyJson) {
    throw new Error('SOLANA_PRIVATE_KEY environment variable is not set.');
  }

  const { Keypair } = await import('@solana/web3.js');

  // Try JSON array format first
  try {
    const parsed: number[] = JSON.parse(secretKeyJson) as number[];
    if (Array.isArray(parsed) && parsed.length === 64) {
      const secretKey = Uint8Array.from(parsed);
      cachedKeypair = Keypair.fromSecretKey(secretKey);
      return cachedKeypair;
    }
  } catch {
    // Not JSON array — try base58
  }

  // Try base58 format (standard Solana secret key encoding)
  try {
    const decoded = base58Decode(secretKeyJson);
    if (decoded.length === 64) {
      cachedKeypair = Keypair.fromSecretKey(decoded);
      return cachedKeypair;
    }
  } catch {
    // Not valid base58
  }

  throw new Error(
    'SOLANA_PRIVATE_KEY is invalid. Expected base58 string (88 chars) or JSON array of 64 numbers.',
  );
}

/**
 * Single source of truth for ARC decimals (pump.fun mints are 6 decimals;
 * verified against GeckoTerminal for the live mint). `SolanaService` also
 * checks the on-chain mint and every `transferChecked` against this value, so
 * a drift shows up as an explicit error instead of silently wrong amounts.
 */
export const ARCADEUM_DECIMALS = 6;

/**
 * ARC/USDC pool used for charts. Same value the web app used to hardcode;
 * served to the web via GET /solana/config so BE and web cannot drift.
 * ARCADEUM_POOL_ADDRESS overrides it.
 */
export const DEFAULT_ARC_POOL_ADDRESS =
  'BHYF1uFfwujrZyLrAQw3vZJQFQ6XEkRk4TNxHo8kTTXj';

/** Classic SPL Token program. */
export const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

/** Token-2022 program (pump.fun tokens may use either program). */
export const TOKEN_2022_PROGRAM_ID =
  'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';

export const SOLANA_TOKEN_PROGRAM_IDS: readonly string[] = [
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
];

/**
 * Create the ARCADEUM mint PublicKey from a base58 address string.
 * Throws if the address is invalid.
 */
export async function getArcadeumMint(
  mintAddress: string,
): Promise<import('@solana/web3.js').PublicKey> {
  const { PublicKey } = await import('@solana/web3.js');
  return new PublicKey(mintAddress);
}

/**
 * Convert human-readable ARCADEUM amount to raw token units.
 */
export function toRawAmount(humanAmount: number): bigint {
  if (!Number.isFinite(humanAmount) || humanAmount < 0) {
    throw new RangeError(`Invalid ARC amount: ${humanAmount}`);
  }
  // Integer math on a fixed 6-decimal string avoids float drift (0.1 + 0.2).
  const [whole, frac = ''] = humanAmount.toFixed(ARCADEUM_DECIMALS).split('.');
  return BigInt(whole + frac.padEnd(ARCADEUM_DECIMALS, '0'));
}

/**
 * Convert raw token units to human-readable ARCADEUM amount.
 */
export function fromRawAmount(rawAmount: bigint): number {
  return Number(rawAmount) / 10 ** ARCADEUM_DECIMALS;
}

export const ARCADEUM_DECIMALS = 6;

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
  return BigInt(Math.round(humanAmount * 10 ** ARCADEUM_DECIMALS));
}

/**
 * Convert raw token units to human-readable ARCADEUM amount.
 */
export function fromRawAmount(rawAmount: bigint): number {
  return Number(rawAmount) / 10 ** ARCADEUM_DECIMALS;
}

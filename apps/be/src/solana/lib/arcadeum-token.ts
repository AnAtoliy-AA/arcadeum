import { PublicKey } from '@solana/web3.js';

export const ARCADEUM_DECIMALS = 9;

/**
 * Create the ARCADEUM mint PublicKey from a base58 address string.
 * Throws if the address is invalid.
 */
export function getArcadeumMint(mintAddress: string): PublicKey {
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

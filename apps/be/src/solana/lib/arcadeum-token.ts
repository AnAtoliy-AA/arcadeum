import { PublicKey } from '@solana/web3.js';

/**
 * ARCADEUM SPL Token configuration.
 * Replace MINT_ADDRESS with your actual token mint after launching on Pump.fun.
 */
export const ARCADEUM_MINT_ADDRESS = new PublicKey(
  process.env.ARCADEUM_MINT_ADDRESS ?? '11111111111111111111111111111111',
);

export const ARCADEUM_DECIMALS = 9;

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

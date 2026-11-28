import type { ConfigService } from '@nestjs/config';
import { DEFAULT_ARC_POOL_ADDRESS } from './arcadeum-token';
import { isValidSolanaAddress } from './base58';

export const DEFAULT_PUBLIC_RPC = 'https://api.mainnet-beta.solana.com';

export interface SolanaRuntimeConfig {
  /** Validated ARC mint, or null when missing/invalid (see `issues`). */
  mint: string | null;
  treasury: string;
  poolAddress: string;
  rpcUrls: string[];
  rpcConfigured: boolean;
  /** Reject deposits older than this many seconds. */
  txMaxAgeSeconds: number;
  /** Accept payments this percent below the quoted amount (default 0). */
  tolerancePercent: number;
  /** Human readable problems; empty when the config is usable. */
  issues: string[];
}

function num(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return value !== undefined && value !== '' && Number.isFinite(n) && n >= 0
    ? n
    : fallback;
}

export function readSolanaConfig(config: ConfigService): SolanaRuntimeConfig {
  const issues: string[] = [];
  const rawMint = (config.get<string>('ARCADEUM_MINT_ADDRESS') ?? '').trim();
  let mint: string | null = null;
  if (!rawMint) {
    issues.push('ARCADEUM_MINT_ADDRESS is not set: ARC payments are disabled');
  } else if (!isValidSolanaAddress(rawMint)) {
    issues.push(
      'ARCADEUM_MINT_ADDRESS is not a valid base58 32-byte address: ARC payments are disabled',
    );
  } else {
    mint = rawMint;
  }

  const treasury = (config.get<string>('SOLANA_TREASURY_ADDRESS') ?? '').trim();
  if (!treasury) {
    issues.push('SOLANA_TREASURY_ADDRESS is not set');
  } else if (!isValidSolanaAddress(treasury)) {
    issues.push('SOLANA_TREASURY_ADDRESS is not a valid Solana address');
  }

  const primary = (config.get<string>('SOLANA_RPC_URL') ?? '').trim();
  const rpcConfigured = primary.length > 0;
  if (!rpcConfigured) {
    issues.push(
      `SOLANA_RPC_URL is not set: using the public RPC ${DEFAULT_PUBLIC_RPC} (rate limited)`,
    );
  }
  const fallbacks = (config.get<string>('SOLANA_RPC_FALLBACK_URLS') ?? '')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean);
  const rpcUrls = [...new Set([primary || DEFAULT_PUBLIC_RPC, ...fallbacks])];

  const pool = (config.get<string>('ARCADEUM_POOL_ADDRESS') ?? '').trim();
  const poolAddress = isValidSolanaAddress(pool)
    ? pool
    : DEFAULT_ARC_POOL_ADDRESS;
  if (pool && !isValidSolanaAddress(pool)) {
    issues.push('ARCADEUM_POOL_ADDRESS is invalid: using the default pool');
  }

  return {
    mint,
    treasury,
    poolAddress,
    rpcUrls,
    rpcConfigured,
    txMaxAgeSeconds: num(config.get<string>('ARC_TX_MAX_AGE_SECONDS'), 1800),
    tolerancePercent: Math.min(
      num(config.get<string>('ARC_PAYMENT_TOLERANCE_PERCENT'), 0),
      10,
    ),
    issues,
  };
}

/** Host only: RPC URLs often embed an API key in the path or query. */
export function redactRpcUrl(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return 'invalid-url';
  }
}

/**
 * GeckoTerminal fallback for the ARC memecoin. The pump.fun frontend API and
 * CoinGecko do not cover a token still on the pump.fun bonding curve (the
 * pump.fun endpoint answers 404/403 and CoinGecko answers `{}`), whereas
 * GeckoTerminal indexes the pool and serves price + token info without a key.
 */
const BASE = 'https://api.geckoterminal.com/api/v2/networks/solana';
const TIMEOUT_MS = 8_000;

export interface GeckoTokenSnapshot {
  name: string | null;
  symbol: string | null;
  image: string | null;
  /** Human-readable total supply (already divided by decimals). */
  totalSupply: string | null;
  priceUsd: number;
  /** Fully diluted valuation of the deepest pool (equals market cap here). */
  fdvUsd: number | null;
}

interface TokenResponse {
  data?: {
    attributes?: {
      name?: string;
      symbol?: string;
      image_url?: string | null;
      normalized_total_supply?: string | null;
    };
  };
}

interface PoolsResponse {
  data?: Array<{
    attributes?: {
      token_price_usd?: string | null;
      fdv_usd?: string | null;
      reserve_in_usd?: string | null;
    };
  }>;
}

async function getJson<T>(path: string): Promise<T | null> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

function positive(value: string | null | undefined): number | null {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function fetchGeckoTerminalToken(
  mintAddress: string,
): Promise<GeckoTokenSnapshot | null> {
  const mint = encodeURIComponent(mintAddress);
  const [token, pools] = await Promise.all([
    getJson<TokenResponse>(`/tokens/${mint}`).catch(() => null),
    getJson<PoolsResponse>(`/tokens/${mint}/pools`).catch(() => null),
  ]);
  const attrs = token?.data?.attributes;
  // Deepest pool is the most representative quote.
  const pool = [...(pools?.data ?? [])].sort(
    (a, b) =>
      (positive(b.attributes?.reserve_in_usd) ?? 0) -
      (positive(a.attributes?.reserve_in_usd) ?? 0),
  )[0]?.attributes;
  if (!attrs && !pool) return null;

  return {
    name: attrs?.name || null,
    symbol: attrs?.symbol || null,
    image: attrs?.image_url || null,
    totalSupply: attrs?.normalized_total_supply ?? null,
    priceUsd: positive(pool?.token_price_usd) ?? 0,
    fdvUsd: positive(pool?.fdv_usd),
  };
}

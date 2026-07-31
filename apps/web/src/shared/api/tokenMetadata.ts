interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string | null;
  pumpfunUrl: string | null;
  marketCapUsd: number | null;
  totalSupply: string | null;
  createdAt: number | null;
  twitter: string | null;
  website: string | null;
  treasuryBalance: {
    sol: number;
    arcadeum: number;
  } | null;
}

let cachePromise: Promise<TokenMetadata | null> | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 60_000;

export function fetchTokenMetadata(): Promise<TokenMetadata | null> {
  const now = Date.now();
  if (cachePromise && now < cacheExpiry) return cachePromise;

  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
  cachePromise = fetch(`${base}/solana/token-metadata`)
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (data?.name && data?.symbol) return data as TokenMetadata;
      return null;
    })
    .catch(() => null);
  cacheExpiry = now + CACHE_TTL_MS;
  return cachePromise;
}

export function invalidateTokenMetadataCache() {
  cachePromise = null;
  cacheExpiry = 0;
}

export type { TokenMetadata };

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
}

let cachePromise: Promise<TokenMetadata | null> | null = null;

export function fetchTokenMetadata(): Promise<TokenMetadata | null> {
  if (cachePromise) return cachePromise;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
  cachePromise = fetch(`${base}/solana/token-metadata`)
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (data?.name && data?.symbol) return data as TokenMetadata;
      return null;
    })
    .catch(() => null);
  return cachePromise;
}

export type { TokenMetadata };

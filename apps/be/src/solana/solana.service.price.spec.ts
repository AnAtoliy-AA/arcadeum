import { ConfigService } from '@nestjs/config';
import { SolanaService } from './solana.service';

// Real ARC mint (public), as served by GeckoTerminal for the app's ARC/USDC pool.
const MINT = '7aRVHPcJnsGWBZMNe2igQsLQmQb4LCCtpuiJgxHjpump';

type Route = { ok: boolean; status?: number; body?: unknown };

/** Routes fetch by URL substring so each upstream can be failed on its own. */
function mockFetch(routes: Record<string, Route>) {
  global.fetch = jest.fn((url: string) => {
    const u = url;
    const key = Object.keys(routes).find((k) => u.includes(k));
    const r = key ? routes[key] : { ok: false, status: 404 };
    return Promise.resolve({
      ok: r.ok,
      status: r.status ?? (r.ok ? 200 : 404),
      json: () => Promise.resolve(r.body ?? {}),
    });
  }) as unknown as typeof fetch;
}

const GECKO_TOKEN = {
  data: {
    attributes: {
      name: 'Arcadeum Games',
      symbol: 'ARC',
      image_url: 'https://img/arc.png',
      normalized_total_supply: '1000000000.0',
    },
  },
};
const GECKO_POOLS = {
  data: [
    {
      attributes: {
        token_price_usd: '0.0000045',
        fdv_usd: '4501.5',
        reserve_in_usd: '3912',
      },
    },
    {
      attributes: {
        token_price_usd: '9',
        fdv_usd: '9',
        reserve_in_usd: '1',
      },
    },
  ],
};

function service() {
  const svc = new SolanaService({
    get: (k: string) => (k === 'ARCADEUM_MINT_ADDRESS' ? MINT : undefined),
  } as unknown as ConfigService);
  // Jest cannot load the ESM web3 module; a minimal PublicKey is enough here.
  class PublicKey {
    constructor(private readonly key: string) {}
    toBase58() {
      return this.key;
    }
  }
  (svc as unknown as { loadWeb3: () => Promise<unknown> }).loadWeb3 = () =>
    Promise.resolve({ PublicKey });
  return svc;
}

describe('SolanaService ARC price + metadata sources', () => {
  afterEach(() => jest.restoreAllMocks());

  it('falls back to GeckoTerminal when pump.fun 404s and CoinGecko has no listing', async () => {
    mockFetch({
      'frontend-api-v3.pump.fun': { ok: false, status: 404 },
      'coingecko.com': { ok: true, body: {} },
      '/pools': { ok: true, body: GECKO_POOLS },
      'geckoterminal.com': { ok: true, body: GECKO_TOKEN },
    });

    await expect(service().getArcadeumPrice()).resolves.toBe(0.0000045);
  });

  it('prefers the deepest pool quote', async () => {
    mockFetch({
      '/pools': { ok: true, body: GECKO_POOLS },
      'geckoterminal.com': { ok: true, body: GECKO_TOKEN },
    });

    await expect(service().getArcadeumPrice()).resolves.toBe(0.0000045);
  });

  it('returns 0 (ARC payments stay disabled) when every source fails', async () => {
    mockFetch({});

    await expect(service().getArcadeumPrice()).resolves.toBe(0);
  });

  it('does not call GeckoTerminal when CoinGecko already answered', async () => {
    mockFetch({
      'coingecko.com': { ok: true, body: { [MINT]: { usd: 0.5 } } },
    });

    await expect(service().getArcadeumPrice()).resolves.toBe(0.5);
    const urls = (global.fetch as jest.Mock<unknown, [string]>).mock.calls.map(
      ([u]) => u,
    );
    expect(urls.some((u) => u.includes('geckoterminal'))).toBe(false);
  });

  it('serves token metadata from GeckoTerminal when pump.fun is gone', async () => {
    mockFetch({
      'frontend-api-v3.pump.fun': { ok: false, status: 404 },
      '/pools': { ok: true, body: GECKO_POOLS },
      'geckoterminal.com': { ok: true, body: GECKO_TOKEN },
    });

    await expect(service().getTokenMetadata()).resolves.toMatchObject({
      name: 'Arcadeum Games',
      symbol: 'ARC',
      image: 'https://img/arc.png',
      marketCapUsd: 4501.5,
      totalSupply: '1000000000.0',
      pumpfunUrl: `https://pump.fun/coin/${MINT}`,
    });
  });

  it('returns null metadata when every source fails', async () => {
    mockFetch({});

    await expect(service().getTokenMetadata()).resolves.toBeNull();
  });
});

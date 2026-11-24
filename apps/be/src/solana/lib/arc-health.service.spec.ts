import { ArcHealthService } from './arc-health.service';

jest.mock('../solana.service', () => ({ SolanaService: class {} }));

function make(over: Record<string, unknown> = {}) {
  const solana = {
    getRuntimeConfig: () => ({
      mint: '7aRVHPcJnsGWBZMNe2igQsLQmQb4LCCtpuiJgxHjpump',
      poolAddress: 'pool',
      treasury: 'T',
      rpcUrls: ['https://rpc.example/v2/SECRET?api-key=abc'],
      rpcConfigured: true,
      txMaxAgeSeconds: 1800,
      tolerancePercent: 0,
      issues: [],
    }),
    checkRpc: jest.fn().mockResolvedValue({ ok: true, latencyMs: 12 }),
    getArcadeumQuote: jest.fn().mockResolvedValue({
      priceUsd: 0.0000045,
      status: 'ok',
      source: 'geckoterminal',
      ageMs: 4_000,
    }),
    getMintDecimalsOnChain: jest.fn().mockResolvedValue(6),
    ...over,
  };
  const economy = {
    getNumber: jest.fn((k: string) =>
      Promise.resolve(k.includes('allow') ? 1 : 10),
    ),
  };
  return new ArcHealthService(solana as never, economy as never);
}

describe('ArcHealthService', () => {
  it('reports a healthy environment without leaking RPC secrets', async () => {
    const h = await make().getHealth();
    expect(h.ok).toBe(true);
    expect(h.config.rpcHosts).toEqual(['rpc.example']);
    expect(JSON.stringify(h)).not.toMatch(/SECRET|api-key/);
    expect(h.price).toMatchObject({ source: 'geckoterminal', ageSeconds: 4 });
    expect(h.flags).toEqual({
      gemsAllowArcadeum: true,
      shopAllowArcadeum: true,
      arcadeumDiscountPercent: 10,
    });
    expect(h.decimals).toMatchObject({ code: 6, onChain: 6 });
  });

  it('lists problems: unhealthy RPC, stale price, decimals drift', async () => {
    const h = await make({
      checkRpc: jest
        .fn()
        .mockResolvedValue({ ok: false, latencyMs: 1, error: 'down' }),
      getArcadeumQuote: jest.fn().mockResolvedValue({
        priceUsd: 0,
        status: 'unavailable',
        source: null,
        ageMs: null,
        reason: 'x',
      }),
    }).getHealth();
    expect(h.ok).toBe(false);
    expect(h.problems.join()).toMatch(/RPC unhealthy: down/);
    expect(h.problems.join()).toMatch(/price unavailable/);

    const drift = await make({
      getMintDecimalsOnChain: jest.fn().mockResolvedValue(9),
    }).getHealth();
    expect(drift.problems.join()).toMatch(/decimals on chain \(9\) differ/);
  });
});

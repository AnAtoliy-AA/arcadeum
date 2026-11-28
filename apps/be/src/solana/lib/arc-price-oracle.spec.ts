import { ArcPriceOracle } from './arc-price-oracle';

const MINT = '7aRVHPcJnsGWBZMNe2igQsLQmQb4LCCtpuiJgxHjpump';
const MIN = 60_000;

interface Upstreams {
  coingecko?: number | 'down' | '429';
  pumpfun?: number | 'down';
  gecko?: number | 'down';
}

function setup(up: Upstreams = {}, mint: string | null = MINT) {
  let t = 1_000_000;
  const state: Upstreams = { ...up };
  const calls = { coingecko: 0, pumpfun: 0, gecko: 0 };
  const fetchFn = jest.fn((url: string) => {
    const respond = (ok: boolean, status: number, body: unknown) =>
      Promise.resolve({ ok, status, json: () => Promise.resolve(body) });
    if (url.includes('coingecko')) {
      calls.coingecko++;
      const v = state.coingecko;
      if (v === '429') return respond(false, 429, {});
      if (v === 'down') return Promise.reject(new Error('fetch failed'));
      return respond(true, 200, v ? { [MINT]: { usd: v } } : {});
    }
    if (url.includes('pump.fun')) {
      calls.pumpfun++;
      const v = state.pumpfun;
      if (v === 'down' || v === undefined) return respond(false, 404, {});
      return respond(true, 200, {
        usd_market_cap: v * 1_000_000_000,
        total_supply_str: '1000000000000000',
        base_decimals: 6,
      });
    }
    calls.gecko++;
    const v = state.gecko;
    if (v === 'down') return Promise.reject(new Error('fetch failed'));
    if (url.includes('/pools')) {
      return respond(true, 200, {
        data: v
          ? [
              {
                attributes: { token_price_usd: String(v), reserve_in_usd: '5' },
              },
            ]
          : [],
      });
    }
    return respond(true, 200, {
      data: { attributes: { name: 'A', symbol: 'ARC' } },
    });
  });
  const oracle = new ArcPriceOracle(() => mint, {
    now: () => t,
    fetchFn: fetchFn as unknown as typeof fetch,
  });
  return {
    oracle,
    calls,
    state,
    advance: (ms: number) => {
      t += ms;
    },
  };
}

describe('ArcPriceOracle', () => {
  it('is unconfigured (not a silent 0 quote) without a mint', async () => {
    const { oracle } = setup({}, null);
    const q = await oracle.getQuote();
    expect(q).toMatchObject({ status: 'unconfigured', priceUsd: 0 });
    expect(await oracle.getCheckoutPrice()).toBe(0);
  });

  it('reports the source that produced the price', async () => {
    const { oracle } = setup({ gecko: 0.0000045 });
    const q = await oracle.getQuote();
    expect(q).toMatchObject({
      status: 'ok',
      priceUsd: 0.0000045,
      source: 'geckoterminal',
    });
  });

  it('prefers coingecko and takes the lower price when two sources disagree', async () => {
    const { oracle } = setup({ coingecko: 0.002, pumpfun: 0.001 });
    expect((await oracle.getQuote()).priceUsd).toBe(0.001);
  });

  it('serves from cache within the fresh TTL (no refetch)', async () => {
    const { oracle, calls, advance } = setup({ coingecko: 1 });
    await oracle.getQuote();
    advance(30_000);
    await oracle.getQuote();
    expect(calls.coingecko).toBe(1);
  });

  it('negative-caches a total failure so upstreams are not hammered', async () => {
    const { oracle, calls, advance } = setup({});
    expect((await oracle.getQuote()).status).toBe('unavailable');
    const first = calls.gecko;
    advance(10_000);
    await oracle.getQuote();
    expect(calls.gecko).toBe(first);
  });

  it('backs off a rate limited source (429) instead of retrying hot', async () => {
    const { oracle, calls, advance } = setup({
      coingecko: '429',
      gecko: 'down',
    });
    await oracle.getQuote();
    expect(calls.coingecko).toBe(1);
    advance(31_000); // negative cache over, 429 cooldown (60s) still running
    await oracle.getQuote();
    expect(calls.coingecko).toBe(1);
    advance(31_000); // cooldown over: the source is tried again
    await oracle.getQuote();
    expect(calls.coingecko).toBe(2);
  });

  it('serves the last good price flagged stale, but checkout refuses it', async () => {
    const { oracle, state, advance } = setup({ coingecko: 1 });
    expect(await oracle.getCheckoutPrice()).toBe(1);
    state.coingecko = 'down';
    state.gecko = 'down';
    advance(6 * MIN); // older than the 5 min checkout limit
    const display = await oracle.getQuote();
    expect(display).toMatchObject({ status: 'stale', priceUsd: 1 });
    expect(await oracle.getCheckoutPrice()).toBe(0);
  });

  it('drops a price older than the display limit entirely', async () => {
    const { oracle, state, advance } = setup({ coingecko: 1 });
    await oracle.getQuote();
    state.coingecko = 'down';
    state.gecko = 'down';
    advance(31 * MIN);
    expect(await oracle.getQuote()).toMatchObject({
      status: 'unavailable',
      priceUsd: 0,
    });
  });

  it('rejects a sudden crash on thin liquidity and keeps the reference', async () => {
    const { oracle, state, advance } = setup({ coingecko: 1 });
    await oracle.getQuote();
    state.coingecko = 0.1; // 10x drop
    advance(2 * MIN);
    const q = await oracle.getQuote({ forCheckout: true });
    expect(q.priceUsd).toBe(1);
  });

  it('rejects a sudden spike too', async () => {
    const { oracle, state, advance } = setup({ coingecko: 1 });
    await oracle.getQuote();
    state.coingecko = 50;
    advance(2 * MIN);
    expect((await oracle.getQuote({ forCheckout: true })).priceUsd).toBe(1);
  });

  it('accepts a big move once the old reference is too old to trust', async () => {
    const { oracle, state, advance } = setup({ coingecko: 1 });
    await oracle.getQuote();
    state.coingecko = 0.1;
    advance(31 * MIN);
    expect((await oracle.getQuote({ forCheckout: true })).priceUsd).toBe(0.1);
  });

  it('rejects absurd values (above the sanity cap)', async () => {
    const { oracle } = setup({ coingecko: 5_000_000 });
    expect((await oracle.getQuote()).status).toBe('unavailable');
  });

  it('dedupes concurrent refreshes into one upstream call', async () => {
    const { oracle, calls } = setup({ coingecko: 1 });
    await Promise.all([
      oracle.getQuote(),
      oracle.getQuote(),
      oracle.getQuote(),
    ]);
    expect(calls.coingecko).toBe(1);
  });

  it('peek never triggers a fetch', () => {
    const { oracle, calls } = setup({ coingecko: 1 });
    expect(oracle.peek().status).toBe('unavailable');
    expect(calls.coingecko).toBe(0);
  });
});

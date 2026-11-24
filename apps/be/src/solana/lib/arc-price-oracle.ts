import { Logger } from '@nestjs/common';
import { fetchGeckoTerminalToken } from './geckoterminal';

export type ArcPriceSourceName = 'coingecko' | 'pumpfun' | 'geckoterminal';
export type ArcPriceStatus = 'ok' | 'stale' | 'unavailable' | 'unconfigured';

export interface ArcPriceQuote {
  /** USD per ARC. 0 whenever `status` is not `ok` or `stale`. */
  priceUsd: number;
  status: ArcPriceStatus;
  source: ArcPriceSourceName | null;
  /** Milliseconds since the price was fetched, or null when there is none. */
  ageMs: number | null;
  reason?: string;
}

export interface ArcPriceOracleOptions {
  now?: () => number;
  fetchFn?: typeof fetch;
  /** Cache a fetched price this long before refetching. */
  freshTtlMs?: number;
  /** Failed refresh is remembered this long (negative cache). */
  failureTtlMs?: number;
  /** Checkout never uses a price older than this. */
  checkoutMaxAgeMs?: number;
  /** Display shows a last good price up to this age, flagged `stale`. */
  displayMaxAgeMs?: number;
  /** Fresh quote must stay within [previous / swing, previous * swing]. */
  swingFactor?: number;
  /** Prices above this are treated as corrupt. */
  maxSanePriceUsd?: number;
}

const FETCH_TIMEOUT_MS = 8_000;
const BACKOFF_BASE_MS = 30_000;
const BACKOFF_MAX_MS = 10 * 60_000;

interface Cached {
  priceUsd: number;
  source: ArcPriceSourceName;
  fetchedAt: number;
}

/**
 * ARC/USD oracle. The price decides how many ARC a checkout requires, so it
 * errs on the side of "unavailable" over a wrong number:
 *  - fresh cache, in-flight dedupe, negative cache after a failed refresh
 *  - per-source exponential backoff (and 429 cooldown) so upstream rate limits
 *    are not hammered
 *  - last good price may be shown (flagged `stale`) but checkout refuses it
 *    once older than `checkoutMaxAgeMs`
 *  - zero/NaN/absurd values and sudden swings are rejected
 */
export class ArcPriceOracle {
  private readonly logger = new Logger(ArcPriceOracle.name);
  private readonly now: () => number;
  private readonly fetchFn: typeof fetch;
  private readonly freshTtlMs: number;
  private readonly failureTtlMs: number;
  private readonly checkoutMaxAgeMs: number;
  private readonly displayMaxAgeMs: number;
  private readonly swingFactor: number;
  private readonly maxSanePriceUsd: number;

  private cached: Cached | null = null;
  private lastFailure: { at: number; reason: string } | null = null;
  private inFlight: Promise<void> | null = null;
  private readonly sourceState = new Map<
    ArcPriceSourceName,
    { failures: number; retryAt: number }
  >();
  private lastLoggedSource: ArcPriceSourceName | null = null;

  constructor(
    private readonly getMintAddress: () => string | null,
    opts: ArcPriceOracleOptions = {},
  ) {
    this.now = opts.now ?? Date.now;
    this.fetchFn =
      opts.fetchFn ??
      ((input: string | URL | Request, init?: RequestInit) =>
        fetch(input, init));
    this.freshTtlMs = opts.freshTtlMs ?? 60_000;
    this.failureTtlMs = opts.failureTtlMs ?? 30_000;
    this.checkoutMaxAgeMs = opts.checkoutMaxAgeMs ?? 5 * 60_000;
    this.displayMaxAgeMs = opts.displayMaxAgeMs ?? 30 * 60_000;
    this.swingFactor = opts.swingFactor ?? 4;
    this.maxSanePriceUsd = opts.maxSanePriceUsd ?? 1_000;
  }

  /** Price for checkout: fresh enough or 0 (unavailable). Awaits a refresh. */
  async getCheckoutPrice(): Promise<number> {
    const quote = await this.getQuote({ forCheckout: true });
    return quote.status === 'ok' ? quote.priceUsd : 0;
  }

  /**
   * Quote for display. Serves the last good price immediately (stale while
   * revalidate) and refreshes in the background when it has expired.
   */
  async getQuote(opts: { forCheckout?: boolean } = {}): Promise<ArcPriceQuote> {
    if (!this.getMintAddress()) {
      return this.quote(0, 'unconfigured', null, null, 'mint not configured');
    }
    const now = this.now();
    const age = this.cached ? now - this.cached.fetchedAt : null;
    const isFresh = age !== null && age <= this.freshTtlMs;

    if (!isFresh) {
      const recentlyFailed =
        this.lastFailure && now - this.lastFailure.at < this.failureTtlMs;
      const canServeStale =
        !opts.forCheckout && age !== null && age <= this.displayMaxAgeMs;
      if (!recentlyFailed) {
        const refresh = this.refresh();
        if (!canServeStale) await refresh;
        else void refresh;
      }
    }
    return this.currentQuote();
  }

  /** Snapshot without triggering any fetch (health endpoint). */
  peek(): ArcPriceQuote {
    if (!this.getMintAddress()) {
      return this.quote(0, 'unconfigured', null, null, 'mint not configured');
    }
    return this.currentQuote();
  }

  private currentQuote(): ArcPriceQuote {
    const now = this.now();
    const c = this.cached;
    if (!c) {
      return this.quote(
        0,
        'unavailable',
        null,
        null,
        this.lastFailure?.reason ?? 'no price fetched yet',
      );
    }
    const age = now - c.fetchedAt;
    if (age <= this.checkoutMaxAgeMs) {
      return this.quote(c.priceUsd, 'ok', c.source, age);
    }
    if (age <= this.displayMaxAgeMs) {
      return this.quote(c.priceUsd, 'stale', c.source, age, 'price is stale');
    }
    return this.quote(0, 'unavailable', c.source, age, 'price too old');
  }

  private quote(
    priceUsd: number,
    status: ArcPriceStatus,
    source: ArcPriceSourceName | null,
    ageMs: number | null,
    reason?: string,
  ): ArcPriceQuote {
    return { priceUsd, status, source, ageMs, reason };
  }

  private refresh(): Promise<void> {
    if (!this.inFlight) {
      this.inFlight = this.doRefresh().finally(() => {
        this.inFlight = null;
      });
    }
    return this.inFlight;
  }

  private async doRefresh(): Promise<void> {
    const mint = this.getMintAddress();
    if (!mint) return;
    const now = this.now();

    const [cg, pf] = await Promise.all([
      this.fromSource('coingecko', () => this.coingecko(mint)),
      this.fromSource('pumpfun', () => this.pumpfun(mint)),
    ]);
    const { candidate, source } = await this.pickPrice(mint, cg, pf);

    const reject = this.sanityRejection(candidate, now);
    if (reject) {
      this.lastFailure = { at: now, reason: reject };
      this.logger.error(`ARC price rejected: ${reject}`);
      return;
    }

    this.cached = { priceUsd: candidate, source, fetchedAt: now };
    this.lastFailure = null;
    if (this.lastLoggedSource !== source) {
      this.logger.log(`ARC price source: ${source} (${candidate} USD)`);
      this.lastLoggedSource = source;
    }
  }

  /** Chooses the price and its source; GeckoTerminal only when both others gave nothing. */
  private async pickPrice(
    mint: string,
    cg: number,
    pf: number,
  ): Promise<{ candidate: number; source: ArcPriceSourceName }> {
    if (cg > 0 && pf > 0) {
      // Require rough agreement, take the lower one.
      return cg <= pf
        ? { candidate: cg, source: 'coingecko' }
        : { candidate: pf, source: 'pumpfun' };
    }
    if (cg > 0) return { candidate: cg, source: 'coingecko' };
    if (pf > 0) return { candidate: pf, source: 'pumpfun' };
    const candidate = await this.fromSource('geckoterminal', async () => {
      const t = await fetchGeckoTerminalToken(mint, this.fetchFn);
      return t?.priceUsd ?? 0;
    });
    return { candidate, source: 'geckoterminal' };
  }

  private sanityRejection(candidate: number, now: number): string | null {
    if (!Number.isFinite(candidate) || candidate <= 0) {
      return 'no source returned a price';
    }
    if (candidate > this.maxSanePriceUsd) {
      return `price ${candidate} exceeds sanity cap ${this.maxSanePriceUsd}`;
    }
    const prev = this.cached;
    // An old reference is not trusted: accept a new one instead of locking
    // checkout out forever after a real repricing.
    if (prev && now - prev.fetchedAt <= this.displayMaxAgeMs) {
      if (
        candidate < prev.priceUsd / this.swingFactor ||
        candidate > prev.priceUsd * this.swingFactor
      ) {
        return `price ${candidate} swings more than ${this.swingFactor}x from ${prev.priceUsd}`;
      }
    }
    return null;
  }

  /** Runs a source honoring its backoff; returns 0 on any failure. */
  private async fromSource(
    name: ArcPriceSourceName,
    run: () => Promise<number>,
  ): Promise<number> {
    const state = this.sourceState.get(name) ?? { failures: 0, retryAt: 0 };
    const now = this.now();
    if (now < state.retryAt) return 0;
    try {
      const price = await run();
      this.sourceState.set(name, { failures: 0, retryAt: 0 });
      return Number.isFinite(price) && price > 0 ? price : 0;
    } catch (err) {
      const failures = state.failures + 1;
      const isRateLimit = /429/.test(String(err));
      const delay = Math.min(
        BACKOFF_BASE_MS * 2 ** (failures - 1) * (isRateLimit ? 2 : 1),
        BACKOFF_MAX_MS,
      );
      this.sourceState.set(name, { failures, retryAt: now + delay });
      this.logger.warn(
        `ARC price source ${name} failed (${failures}x), backing off ${Math.round(delay / 1000)}s: ${(err as Error).message}`,
      );
      return 0;
    }
  }

  private async getJson<T>(url: string, name: string): Promise<T> {
    const res = await this.fetchFn(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (res.status === 429) throw new Error(`${name} 429 rate limited`);
    // 404/403 means "not listed", not an outage: no backoff escalation.
    if (!res.ok) return {} as T;
    return (await res.json()) as T;
  }

  private async coingecko(mint: string): Promise<number> {
    const data = await this.getJson<Record<string, { usd?: number }>>(
      `https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=${mint}&vs_currencies=usd`,
      'coingecko',
    );
    return data?.[mint]?.usd ?? 0;
  }

  private async pumpfun(mint: string): Promise<number> {
    const d = await this.getJson<{
      usd_market_cap?: number;
      total_supply_str?: string;
      base_decimals?: number;
    }>(`https://frontend-api-v3.pump.fun/coins/${mint}`, 'pumpfun');
    const mc = d.usd_market_cap ?? 0;
    const supply = parseFloat(d.total_supply_str ?? '0');
    const supplyHuman = supply / 10 ** (d.base_decimals ?? 6);
    return mc > 0 && supplyHuman > 0 ? mc / supplyHuman : 0;
  }
}

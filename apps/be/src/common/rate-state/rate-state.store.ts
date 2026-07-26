export interface RateStateStore {
  increment(key: string, windowMs: number): Promise<number>;
  set(key: string, value: number, ttlMs: number): Promise<void>;
  get(key: string): Promise<number | null>;
  setString(key: string, value: string, ttlMs: number): Promise<void>;
  getString(key: string): Promise<string | null>;
  delete(key: string): Promise<void>;
}

export const RATE_STATE_STORE = Symbol('RATE_STATE_STORE');

interface Entry {
  value: number | string;
  expiresAt: number;
}

export class MemoryRateStateStore implements RateStateStore {
  private readonly store = new Map<string, Entry>();
  private lastSweep = Date.now();
  private readonly SWEEP_INTERVAL_MS = 60_000;

  increment(key: string, windowMs: number): Promise<number> {
    this.maybeSweep();
    const now = Date.now();
    const existing = this.store.get(key);

    if (
      !existing ||
      now > existing.expiresAt ||
      typeof existing.value !== 'number'
    ) {
      this.store.set(key, { value: 1, expiresAt: now + windowMs });
      return Promise.resolve(1);
    }

    existing.value++;
    return Promise.resolve(existing.value);
  }

  set(key: string, value: number, ttlMs: number): Promise<void> {
    this.maybeSweep();
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
    return Promise.resolve();
  }

  get(key: string): Promise<number | null> {
    this.maybeSweep();
    const entry = this.store.get(key);
    if (!entry) return Promise.resolve(null);
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return Promise.resolve(null);
    }
    return Promise.resolve(
      typeof entry.value === 'number' ? entry.value : null,
    );
  }

  setString(key: string, value: string, ttlMs: number): Promise<void> {
    this.maybeSweep();
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
    return Promise.resolve();
  }

  getString(key: string): Promise<string | null> {
    this.maybeSweep();
    const entry = this.store.get(key);
    if (!entry) return Promise.resolve(null);
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return Promise.resolve(null);
    }
    return Promise.resolve(
      typeof entry.value === 'string' ? entry.value : null,
    );
  }

  delete(key: string): Promise<void> {
    this.store.delete(key);
    return Promise.resolve();
  }

  private maybeSweep(): void {
    const now = Date.now();
    if (now - this.lastSweep < this.SWEEP_INTERVAL_MS) return;
    this.lastSweep = now;
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

/**
 * Single-flight lock for bot turns.
 *
 * Bot `checkAndPlay` calls can race: every session action re-triggers the
 * current bot, and the watchdog revives stale sessions on its own cadence.
 * Without a lock each trigger spawns its own "sleep then act" chain and the
 * duplicates interleave with real turns, producing irregular pacing in
 * AI-vs-AI matches.
 *
 * Entries carry a timestamp so a crashed/hung chain cannot deadlock a room
 * forever: once an entry outlives `ttlMs`, `tryAcquire` overrides it (the
 * caller is expected to log the override like Sea Battle does).
 */
export class BotTurnLock {
  private readonly entries = new Map<string, number>();

  constructor(private readonly ttlMs = 60_000) {}

  /**
   * Acquire the lock for `key`. Returns false when another chain currently
   * holds a fresh (non-expired) lock; true otherwise (including when an
   * expired entry was overridden).
   */
  tryAcquire(key: string, now = Date.now()): boolean {
    this.sweep(now);
    const heldSince = this.entries.get(key);
    if (heldSince !== undefined && now - heldSince < this.ttlMs) {
      return false;
    }
    this.entries.set(key, now);
    return true;
  }

  /** Age of the existing lock in ms, or null when not locked. */
  ageOf(key: string, now = Date.now()): number | null {
    const heldSince = this.entries.get(key);
    if (heldSince === undefined) return null;
    return now - heldSince;
  }

  release(key: string): void {
    this.entries.delete(key);
  }

  private sweep(now: number): void {
    for (const [key, heldSince] of this.entries) {
      if (now - heldSince >= this.ttlMs) this.entries.delete(key);
    }
  }
}

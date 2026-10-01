'use client';

const STORAGE_KEY = 'arcadeum_solo_active_timer_v1';
/**
 * A gap longer than this between checkpoints means the player was not playing
 * (page closed, machine asleep or timers frozen), so it must not be counted.
 */
const AWAY_GAP_MS = 10_000;
/** Cadence of the display tick and of the away-time checkpoint. */
const TICK_MS = 1_000;
const PERSIST_INTERVAL_MS = 5_000;

interface PersistedActiveTime {
  startedAt: number;
  inactiveMs: number;
  inactive: boolean;
  savedAt: number;
}

type Listener = () => void;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function readPersisted(): PersistedActiveTime | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const candidate = parsed as Partial<PersistedActiveTime>;
    if (
      typeof candidate.startedAt !== 'number' ||
      typeof candidate.inactiveMs !== 'number' ||
      typeof candidate.savedAt !== 'number'
    ) {
      return null;
    }
    return {
      startedAt: candidate.startedAt,
      inactiveMs: candidate.inactiveMs,
      inactive: candidate.inactive === true,
      savedAt: candidate.savedAt,
    };
  } catch {
    return null;
  }
}

/**
 * Single source of truth for solo game elapsed time.
 *
 * The HUD timer and the duration recorded for the leaderboard both read from
 * this tracker, so they can never disagree. Time only accumulates while the
 * game is active: not paused, tab visible, no blocking overlay open and the
 * page actually loaded (time spent away from the page is excluded).
 */
export class SoloActiveTimer {
  private startedAt = 0;
  private running = false;
  private paused = false;
  private blocked = false;
  private hidden = false;
  private inactiveSince: number | null = null;
  private inactiveMs = 0;
  private frozenMs = 0;
  private snapshotMs = 0;
  private lastBeatAt = 0;
  private lastPersistAt = 0;
  private tickId: ReturnType<typeof setInterval> | null = null;
  private readonly listeners = new Set<Listener>();

  constructor() {
    if (!isBrowser()) return;
    this.hidden = document.hidden;
    document.addEventListener('visibilitychange', this.handleVisibility);
    window.addEventListener('pagehide', this.handlePageHide);
  }

  private handleVisibility = (): void => {
    this.setHidden(document.hidden);
  };

  private handlePageHide = (): void => {
    this.persist();
  };

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Recomputes the published value. Subscribers are only notified when the
   * value actually changed, so a paused timer does not re-render every second.
   */
  private emit(force = false): void {
    const next = this.getActiveMs();
    const changed = next !== this.snapshotMs;
    if (changed) this.snapshotMs = next;
    if (!changed && !force) return;
    for (const listener of this.listeners) listener();
  }

  /**
   * Cached value for `useSyncExternalStore`. Stale values from a previous
   * session are hidden, so a freshly mounted game never shows another game's
   * time.
   */
  getSnapshotFor(startedAt: number): number {
    if (!this.running || this.startedAt !== startedAt) return 0;
    return this.snapshotMs;
  }

  start(startedAt: number): void {
    const now = Date.now();
    if (this.running && this.startedAt === startedAt) return;
    this.startedAt = startedAt;
    this.running = true;
    this.frozenMs = 0;
    this.hidden = isBrowser() ? document.hidden : false;
    this.inactiveMs = this.resolveInactiveMsOnStart(now);
    this.inactiveSince = this.isInactive() ? now : null;
    this.startTick();
    this.persist();
    this.emit(true);
  }

  private resolveInactiveMsOnStart(now: number): number {
    const saved = readPersisted();
    if (saved && saved.startedAt === this.startedAt) {
      const gap = now - saved.savedAt;
      return saved.inactiveMs + (saved.inactive || gap > AWAY_GAP_MS ? gap : 0);
    }
    // No accounting for this session (first run after the feature shipped, or
    // a game created long before this page load): it was not being played.
    const age = now - this.startedAt;
    return age > AWAY_GAP_MS ? age : 0;
  }

  stop(): void {
    if (!this.running) return;
    this.frozenMs = this.getActiveMs();
    this.persist();
    this.running = false;
    this.inactiveMs = 0;
    this.inactiveSince = null;
    this.stopTick();
    this.emit(true);
  }

  setPaused(paused: boolean): void {
    if (this.paused === paused) return;
    this.paused = paused;
    this.updateInactive(Date.now());
    this.persist();
    this.emit();
  }

  /** Blocks counting while a non-gameplay overlay (rules modal) is open. */
  setBlocked(blocked: boolean): void {
    if (this.blocked === blocked) return;
    this.blocked = blocked;
    this.updateInactive(Date.now());
    this.persist();
    this.emit();
  }

  private setHidden(hidden: boolean): void {
    if (this.hidden === hidden) return;
    this.hidden = hidden;
    this.updateInactive(Date.now());
    this.persist();
    this.emit();
  }

  private isInactive(): boolean {
    return this.paused || this.blocked || this.hidden;
  }

  private updateInactive(now: number): void {
    if (this.isInactive()) {
      if (this.inactiveSince === null) this.inactiveSince = now;
      return;
    }
    if (this.inactiveSince !== null) {
      this.inactiveMs += now - this.inactiveSince;
      this.inactiveSince = null;
    }
  }

  getActiveMs(): number {
    const now = Date.now();
    if (!this.running) return this.frozenMs;
    const open = this.inactiveSince !== null ? now - this.inactiveSince : 0;
    return Math.max(0, now - this.startedAt - this.inactiveMs - open);
  }

  /** Active time for a given session, or null when that session is not live. */
  getActiveMsFor(startedAt: number): number | null {
    if (!this.running || this.startedAt !== startedAt) return null;
    return this.getActiveMs();
  }

  private startTick(): void {
    this.stopTick();
    const tickStartedAt = Date.now();
    this.lastBeatAt = tickStartedAt;
    this.lastPersistAt = tickStartedAt;
    this.tickId = setInterval(() => {
      const now = Date.now();
      const gap = now - this.lastBeatAt;
      this.lastBeatAt = now;
      // A long stall while nominally active means the device slept or timers
      // were frozen - that stretch was not active play.
      if (gap > AWAY_GAP_MS && this.inactiveSince === null) {
        this.inactiveMs += gap;
      }
      this.emit();
      if (now - this.lastPersistAt >= PERSIST_INTERVAL_MS) {
        this.lastPersistAt = now;
        this.persist();
      }
    }, TICK_MS);
  }

  private stopTick(): void {
    if (this.tickId !== null) {
      clearInterval(this.tickId);
      this.tickId = null;
    }
  }

  private persist(): void {
    if (!this.running || !isBrowser()) return;
    const now = Date.now();
    const inactiveMs =
      this.inactiveMs +
      (this.inactiveSince !== null ? now - this.inactiveSince : 0);
    const snapshot: PersistedActiveTime = {
      startedAt: this.startedAt,
      inactiveMs,
      inactive: this.isInactive(),
      savedAt: now,
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // Storage can be unavailable (private mode / quota); timing still works
      // in memory, only the away-from-page exclusion degrades.
    }
  }
}

export const soloActiveTimer = new SoloActiveTimer();

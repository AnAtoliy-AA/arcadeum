import { Injectable } from '@nestjs/common';
import type { LeaderboardSnapshotDto } from './dtos/leaderboard-snapshot.dto';

const DEFAULT_TTL_MS = 30_000;
const RAW_TTL_MS = 30_000;

type Entry = {
  expiresAt: number;
  value: LeaderboardSnapshotDto;
};

type RawEntry<T> = {
  expiresAt: number;
  value: T;
};

/**
 * Tiny in-memory cache for leaderboards.
 *
 * - `get`/`set`: cache the fully-built `LeaderboardSnapshotDto` keyed by
 *   (mode, page, pageSize, q, selfUserId). TTL is 30s by default, which
 *   matches the capture interval and dedupes simultaneous requests.
 * - `getRaw`/`setRaw`: cache the upstream `historyStats.getLeaderboard`
 *   result keyed by (gameId, limit, offset). The full-collection scan it
 *   does dominates request latency, so caching it lets per-mode profile
 *   lookups (5 calls) coalesce to 1 scan and snapshot rebuilds reuse it.
 *
 * `invalidateAll` clears every cached value (snapshot + raw) so capture
 * runs and `markInMatch` invalidations stay accurate.
 */
@Injectable()
export class LeaderboardsCacheService {
  private store = new Map<string, Entry>();
  private raw = new Map<string, RawEntry<unknown>>();

  get(key: string): LeaderboardSnapshotDto | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(
    key: string,
    value: LeaderboardSnapshotDto,
    ttlMs = DEFAULT_TTL_MS,
  ): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  getRaw<T>(key: string): T | null {
    const entry = this.raw.get(key) as RawEntry<T> | undefined;
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      this.raw.delete(key);
      return null;
    }
    return entry.value;
  }

  setRaw<T>(key: string, value: T, ttlMs = RAW_TTL_MS): void {
    this.raw.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  invalidateAll(): void {
    this.store.clear();
    this.raw.clear();
  }

  size(): number {
    return this.store.size + this.raw.size;
  }

  static keyFor(args: {
    mode: string;
    page: number;
    pageSize: number;
    q?: string;
    selfUserId?: string;
  }): string {
    return [
      args.mode,
      args.page,
      args.pageSize,
      args.q ?? '',
      args.selfUserId ?? '',
    ].join('|');
  }

  static rawKeyFor(args: {
    gameId?: string;
    limit: number;
    offset: number;
  }): string {
    return ['raw', args.gameId ?? 'all', args.limit, args.offset].join('|');
  }
}

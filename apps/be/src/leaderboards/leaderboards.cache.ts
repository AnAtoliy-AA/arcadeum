import { Injectable } from '@nestjs/common';
import type { LeaderboardSnapshotDto } from './dtos/leaderboard-snapshot.dto';

const DEFAULT_TTL_MS = 5_000;

type Entry = {
  expiresAt: number;
  value: LeaderboardSnapshotDto;
};

/**
 * Tiny in-memory snapshot cache. Keyed by (mode, page, pageSize, q,
 * selfUserId) so authed users get their own self-row. TTL is short
 * (5s) and capture invalidations clear the whole cache so realtime
 * pushes still feel instant. No external Redis dep — when we need
 * cross-instance caching we lift this to a shared store.
 */
@Injectable()
export class LeaderboardsCacheService {
  private store = new Map<string, Entry>();

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

  invalidateAll(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
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
}

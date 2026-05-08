import { LeaderboardsCacheService } from './leaderboards.cache';
import type { LeaderboardSnapshotDto } from './dtos/leaderboard-snapshot.dto';

const stubSnapshot = (mode: 'all' | 'mafia' = 'all'): LeaderboardSnapshotDto =>
  ({ mode, rows: [], totalRows: 0 }) as unknown as LeaderboardSnapshotDto;

describe('LeaderboardsCacheService', () => {
  let cache: LeaderboardsCacheService;

  beforeEach(() => {
    cache = new LeaderboardsCacheService();
  });

  it('returns null on miss', () => {
    expect(cache.get('any')).toBeNull();
  });

  it('returns the stored value within TTL', () => {
    cache.set('k', stubSnapshot('all'));
    expect(cache.get('k')?.mode).toBe('all');
  });

  it('expires entries after the TTL', () => {
    cache.set('k', stubSnapshot('all'), 1);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(cache.get('k')).toBeNull();
        resolve();
      }, 5);
    });
  });

  it('invalidateAll clears every key', () => {
    cache.set('a', stubSnapshot('all'));
    cache.set('b', stubSnapshot('mafia'));
    expect(cache.size()).toBe(2);
    cache.invalidateAll();
    expect(cache.size()).toBe(0);
  });

  it('keyFor disambiguates by every relevant axis', () => {
    const a = LeaderboardsCacheService.keyFor({
      mode: 'all',
      page: 1,
      pageSize: 50,
    });
    const b = LeaderboardsCacheService.keyFor({
      mode: 'mafia',
      page: 1,
      pageSize: 50,
    });
    const c = LeaderboardsCacheService.keyFor({
      mode: 'all',
      page: 2,
      pageSize: 50,
    });
    const d = LeaderboardsCacheService.keyFor({
      mode: 'all',
      page: 1,
      pageSize: 50,
      q: 'night',
    });
    const e = LeaderboardsCacheService.keyFor({
      mode: 'all',
      page: 1,
      pageSize: 50,
      selfUserId: 'me',
    });
    expect(new Set([a, b, c, d, e]).size).toBe(5);
  });
});

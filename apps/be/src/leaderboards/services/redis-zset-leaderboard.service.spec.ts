import { RedisZsetLeaderboardService } from './redis-zset-leaderboard.service';

describe('RedisZsetLeaderboardService', () => {
  let service: RedisZsetLeaderboardService;

  beforeEach(() => {
    service = new RedisZsetLeaderboardService();
  });

  it('records and retrieves top ranks', async () => {
    await service.recordScore('chess', '2026Q3', 'user_1', 1500);
    await service.recordScore('chess', '2026Q3', 'user_2', 1800);
    await service.recordScore('chess', '2026Q3', 'user_3', 1200);

    const top = await service.getTopRanks('chess', '2026Q3', 10, 0);
    expect(top).toHaveLength(3);
    expect(top[0]).toEqual({ userId: 'user_2', rank: 1, score: 1800 });
    expect(top[1]).toEqual({ userId: 'user_1', rank: 2, score: 1500 });
    expect(top[2]).toEqual({ userId: 'user_3', rank: 3, score: 1200 });
  });

  it('fetches specific user rank accurately', async () => {
    await service.recordScore('sea_battle', '2026Q3', 'player_a', 100);
    await service.recordScore('sea_battle', '2026Q3', 'player_b', 200);

    const rankB = await service.getUserRank('sea_battle', '2026Q3', 'player_b');
    expect(rankB).toEqual({ userId: 'player_b', rank: 1, score: 200 });

    const rankA = await service.getUserRank('sea_battle', '2026Q3', 'player_a');
    expect(rankA).toEqual({ userId: 'player_a', rank: 2, score: 100 });

    const rankUnknown = await service.getUserRank(
      'sea_battle',
      '2026Q3',
      'unknown',
    );
    expect(rankUnknown).toBeNull();
  });

  it('clears board successfully', async () => {
    await service.recordScore('go', '2026Q3', 'user_x', 999);
    await service.clearBoard('go', '2026Q3');

    const top = await service.getTopRanks('go', '2026Q3');
    expect(top).toEqual([]);
  });
});

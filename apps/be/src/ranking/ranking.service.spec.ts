import { RankingService } from './ranking.service';
import { RankingEntry } from './ranking.schema';
import { PlayerStats } from '../games/schemas/player-stats.schema';
import { User } from '../auth/schemas/user.schema';
import type { Model } from 'mongoose';
import { currentSeason, tierForRating } from './ranking.constants';

type AnyModel = {
  findOne: jest.Mock;
  findOneAndUpdate: jest.Mock;
  find: jest.Mock;
  countDocuments: jest.Mock;
  updateOne: jest.Mock;
};

function chain(resolvedValue: unknown) {
  return { exec: jest.fn().mockResolvedValue(resolvedValue) };
}

function makeModel(overrides: Partial<AnyModel> = {}): AnyModel {
  return {
    findOne: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue(chain(null)),
      }),
    }),
    findOneAndUpdate: jest.fn().mockReturnValue(chain(null)),
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockReturnValue(chain([])),
          }),
        }),
      }),
    }),
    countDocuments: jest.fn().mockReturnValue(chain(0)),
    updateOne: jest.fn().mockReturnValue(chain({})),
    ...overrides,
  };
}

function buildService(
  rankingModel: AnyModel,
  statsModel: AnyModel,
  userModel: AnyModel,
): RankingService {
  return new RankingService(
    rankingModel as unknown as Model<RankingEntry>,
    statsModel as unknown as Model<PlayerStats>,
    userModel as unknown as Model<User>,
  );
}

describe('RankingService', () => {
  const season = currentSeason();

  describe('tierForRating', () => {
    it('maps ratings to roadmap tiers', () => {
      expect(tierForRating(0)).toBe('bronze');
      expect(tierForRating(1199)).toBe('bronze');
      expect(tierForRating(1200)).toBe('silver');
      expect(tierForRating(1399)).toBe('silver');
      expect(tierForRating(1400)).toBe('gold');
      expect(tierForRating(1599)).toBe('gold');
      expect(tierForRating(1600)).toBe('platinum');
      expect(tierForRating(1799)).toBe('platinum');
      expect(tierForRating(1800)).toBe('diamond');
      expect(tierForRating(1999)).toBe('diamond');
      expect(tierForRating(2000)).toBe('master');
    });
  });

  describe('recordRankedResult', () => {
    it('returns {} when a bot is present (not ranked-eligible)', async () => {
      const service = buildService(makeModel(), makeModel(), makeModel());
      const result = await service.recordRankedResult(
        ['user1', 'bot-chess-1'],
        'chess_v1',
        ['user1'],
      );
      expect(result).toEqual({});
    });

    it('returns {} when only one human is present', async () => {
      const service = buildService(makeModel(), makeModel(), makeModel());
      const result = await service.recordRankedResult(['user1'], 'chess_v1', [
        'user1',
      ]);
      expect(result).toEqual({});
    });

    it('applies ELO K=32 for a decisive win starting at 1200', async () => {
      const rankingModel = makeModel();
      const statsModel = makeModel();
      const service = buildService(rankingModel, statsModel, makeModel());

      const result = await service.recordRankedResult(
        ['user1', 'user2'],
        'chess_v1',
        ['user1'],
      );

      expect(result.user1.elo).toBe(1216);
      expect(result.user1.delta).toBe(16);
      expect(result.user1.tier).toBe('silver');
      expect(result.user2.elo).toBe(1184);
      expect(result.user2.delta).toBe(-16);
      expect(result.user2.tier).toBe('bronze');

      // upserts a RankingEntry for each player
      expect(rankingModel.findOneAndUpdate).toHaveBeenCalledTimes(2);
      // mirrors elo into PlayerStats
      expect(statsModel.updateOne).toHaveBeenCalledTimes(2);
    });

    it('keeps both ratings unchanged on a draw between equals', async () => {
      const service = buildService(makeModel(), makeModel(), makeModel());
      const result = await service.recordRankedResult(
        ['user1', 'user2'],
        'checkers_v1',
        [],
      );

      expect(result.user1.elo).toBe(1200);
      expect(result.user1.delta).toBe(0);
      expect(result.user2.elo).toBe(1200);
      expect(result.user2.delta).toBe(0);
    });

    it('seeds from an existing PlayerStats elo when no entry exists', async () => {
      const rankingModel = makeModel();
      const statsModel = makeModel({
        findOne: jest.fn().mockImplementation((query: { userId?: string }) => ({
          select: jest.fn().mockReturnValue({
            lean: jest
              .fn()
              .mockReturnValue(
                chain(query.userId === 'user1' ? { elo: 1500 } : { elo: 1200 }),
              ),
          }),
        })),
      });
      const service = buildService(rankingModel, statsModel, makeModel());

      // user1 at 1500 vs user2 at 1200 -> user1 favoured, smaller win delta
      const result = await service.recordRankedResult(
        ['user1', 'user2'],
        'chess_v1',
        ['user1'],
      );

      const e1 = 1 / (1 + Math.pow(10, (1200 - 1500) / 400));
      const expectedNew1 = Math.round(1500 + 32 * (1 - e1));
      expect(result.user1.elo).toBe(expectedNew1);
      expect(result.user1.elo).toBeLessThan(1516);
      expect(result.user2.elo).toBeGreaterThan(1184);
    });
  });

  describe('getRankings', () => {
    it('returns decorated entries with rank and username', async () => {
      const rankingModel = makeModel({
        countDocuments: jest.fn().mockReturnValue(chain(2)),
        find: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                lean: jest.fn().mockReturnValue(
                  chain([
                    {
                      userId: 'user1',
                      elo: 1600,
                      tier: 'platinum',
                      wins: 10,
                      losses: 2,
                      draws: 0,
                      peakElo: 1650,
                    },
                    {
                      userId: 'user2',
                      elo: 1500,
                      tier: 'gold',
                      wins: 8,
                      losses: 4,
                      draws: 1,
                      peakElo: 1500,
                    },
                  ]),
                ),
              }),
            }),
          }),
        }),
      });
      const userModel = makeModel({
        find: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockReturnValue(
              chain([
                { _id: 'user1', username: 'alice' },
                { _id: 'user2', username: 'bob' },
              ]),
            ),
          }),
        }),
      });
      const service = buildService(rankingModel, makeModel(), userModel);

      const snapshot = await service.getRankings('chess_v1', 20, 0);

      expect(snapshot.gameId).toBe('chess_v1');
      expect(snapshot.season).toBe(season);
      expect(snapshot.total).toBe(2);
      expect(snapshot.entries).toHaveLength(2);
      expect(snapshot.entries[0]).toMatchObject({
        rank: 1,
        userId: 'user1',
        username: 'alice',
        elo: 1600,
        tier: 'platinum',
      });
      expect(snapshot.entries[1].rank).toBe(2);
    });
  });

  describe('getMyRankings', () => {
    it('computes a rank for each game entry', async () => {
      const rankingModel = makeModel({
        find: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockReturnValue(
              chain([
                {
                  gameId: 'chess_v1',
                  elo: 1550,
                  tier: 'gold',
                  peakElo: 1600,
                  wins: 5,
                  losses: 1,
                  draws: 0,
                  rankedGames: 6,
                },
              ]),
            ),
          }),
        }),
        countDocuments: jest.fn().mockReturnValue(chain(12)),
      });
      const service = buildService(rankingModel, makeModel(), makeModel());

      const rows = await service.getMyRankings('user1');

      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        gameId: 'chess_v1',
        season,
        elo: 1550,
        tier: 'gold',
        rankedGames: 6,
        rank: 13,
      });
    });
  });
});

import { RankingService } from './ranking.service';
import { RankingEntry } from './ranking.schema';
import { PlayerStats } from '../games/schemas/player-stats.schema';
import { User } from '../auth/schemas/user.schema';
import type { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { currentSeason, tierForRating } from './ranking.constants';
import {
  SEASON_RESET_ANCHOR_DEFAULT,
  SEASON_RESET_FACTOR_DEFAULT,
} from '../seasons/seasons.constants';

type AnyModel = {
  findOne: jest.Mock;
  findOneAndUpdate: jest.Mock;
  find: jest.Mock;
  countDocuments: jest.Mock;
  aggregate: jest.Mock;
  updateOne: jest.Mock;
  bulkWrite: jest.Mock;
};

function chain(resolvedValue: unknown) {
  return { exec: jest.fn().mockResolvedValue(resolvedValue) };
}

function createChainableQuery(val: unknown = []) {
  const query: Record<string, jest.Mock> = {};
  query.select = jest.fn().mockReturnValue(query);
  query.sort = jest.fn().mockReturnValue(query);
  query.skip = jest.fn().mockReturnValue(query);
  query.limit = jest.fn().mockReturnValue(query);
  query.lean = jest.fn().mockReturnValue(query);
  query.exec = jest.fn().mockResolvedValue(val);
  return query;
}

function makeModel(overrides: Partial<AnyModel> = {}): AnyModel {
  return {
    findOne: jest.fn().mockImplementation(() => createChainableQuery(null)),
    findOneAndUpdate: jest.fn().mockReturnValue(chain(null)),
    find: jest.fn().mockImplementation(() => createChainableQuery([])),
    countDocuments: jest.fn().mockReturnValue(chain(0)),
    aggregate: jest.fn().mockReturnValue(chain([])),
    updateOne: jest.fn().mockReturnValue(chain({})),
    bulkWrite: jest.fn().mockResolvedValue({}),
    ...overrides,
  };
}

function makeConfig(values: Record<string, number> = {}): ConfigService {
  return {
    get: jest.fn((key: string) => values[key]),
  } as unknown as ConfigService;
}

function buildService(
  rankingModel: AnyModel,
  statsModel: AnyModel,
  userModel: AnyModel,
  config: ConfigService = makeConfig(),
): RankingService {
  return new RankingService(
    rankingModel as unknown as Model<RankingEntry>,
    statsModel as unknown as Model<PlayerStats>,
    userModel as unknown as Model<User>,
    config,
  );
}

describe('seasonResetRating defaults', () => {
  it('exposes roadmap reset tuning', () => {
    expect(SEASON_RESET_ANCHOR_DEFAULT).toBe(1500);
    expect(SEASON_RESET_FACTOR_DEFAULT).toBe(0.5);
  });
});

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

      // upserts a RankingEntry for each player via bulkWrite
      expect(rankingModel.bulkWrite).toHaveBeenCalledTimes(1);
      const rankingOps = (
        rankingModel.bulkWrite.mock.calls as Array<
          Array<
            Array<{
              updateOne: { filter: Record<string, unknown>; upsert: boolean };
            }>
          >
        >
      )[0][0];
      expect(rankingOps).toHaveLength(2);
      expect(rankingOps[0].updateOne.upsert).toBe(true);
      // mirrors elo into PlayerStats via bulkWrite
      expect(statsModel.bulkWrite).toHaveBeenCalledTimes(1);
      const statsOps = (
        statsModel.bulkWrite.mock.calls as Array<
          Array<
            Array<{
              updateOne: { filter: Record<string, unknown>; upsert: boolean };
            }>
          >
        >
      )[0][0];
      expect(statsOps).toHaveLength(2);
      expect(statsOps[0].updateOne.upsert).toBe(true);
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

    it('soft-resets all-time Elo toward the season anchor when no season entry exists', async () => {
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

      // user1's all-time 1500 sits on the anchor -> seeds at 1500.
      // user2's all-time 1200 pulls toward 1500 by factor 0.5 -> 1350.
      const result = await service.recordRankedResult(
        ['user1', 'user2'],
        'chess_v1',
        ['user1'],
      );

      // Winner at 1500 beats the 1350 underdog for less than a full K=16.
      const e1 = 1 / (1 + Math.pow(10, (1350 - 1500) / 400));
      const e2 = 1 / (1 + Math.pow(10, (1500 - 1350) / 400));
      expect(result.user1.elo).toBe(Math.round(1500 + 32 * (1 - e1)));
      expect(result.user2.elo).toBe(Math.round(1350 - 32 * e2));
      expect(result.user2.delta).toBeLessThan(0);
    });

    it('seeds from the most recent prior-season rating over the all-time mirror', async () => {
      const rankingModel = makeModel({
        findOne: jest
          .fn()
          .mockImplementation((query: Record<string, unknown>) => {
            const isCurrent = typeof query.season === 'string';
            return {
              select: jest.fn().mockReturnValue({
                lean: jest
                  .fn()
                  .mockReturnValue(
                    isCurrent ? chain(null) : chain({ elo: 1400 }),
                  ),
              }),
              sort: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                  lean: jest.fn().mockReturnValue(chain({ elo: 1400 })),
                }),
              }),
            };
          }),
      });
      const service = buildService(rankingModel, makeModel(), makeModel());

      // Prior-season Elo of 1400 soft-resets to 1450 (pull toward 1500 at
      // factor 0.5), then a win vs the equal 1450 opponent adds +16.
      const result = await service.recordRankedResult(
        ['user1', 'user2'],
        'chess_v1',
        ['user1'],
      );

      expect(result.user1.elo).toBe(1466);
      expect(result.user1.tier).toBe('gold');
    });

    it('honors configured reset anchor and factor', async () => {
      // anchor 1200, factor 1 -> no pull at all; raw mirror used as-is.
      const config = makeConfig({
        SEASON_RESET_ANCHOR: 1200,
        SEASON_RESET_FACTOR: 1,
      });
      const statsModel = makeModel({
        findOne: jest.fn().mockImplementation(() => ({
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockReturnValue(chain({ elo: 1500 })),
          }),
        })),
      });
      const service = buildService(
        makeModel(),
        statsModel,
        makeModel(),
        config,
      );

      const result = await service.recordRankedResult(
        ['user1', 'user2'],
        'chess_v1',
        [],
      );

      expect(result.user1.elo).toBe(1500);
      expect(result.user2.elo).toBe(1500);
    });
  });

  describe('getRankings', () => {
    it('returns decorated entries with rank and username', async () => {
      const rankingModel = makeModel({
        countDocuments: jest.fn().mockReturnValue(chain(2)),
        find: jest.fn().mockImplementation(() =>
          createChainableQuery([
            {
              userId: 'user1',
              elo: 1600,
              tier: 'platinum',
              wins: 10,
              losses: 2,
              draws: 1,
              peakElo: 1650,
            },
            {
              userId: 'user2',
              elo: 1450,
              tier: 'gold',
              wins: 5,
              losses: 5,
              draws: 0,
              peakElo: 1500,
            },
          ]),
        ),
      });
      const userModel = makeModel({
        find: jest.fn().mockImplementation(() =>
          createChainableQuery([
            { _id: 'user1', username: 'alice' },
            { _id: 'user2', username: 'bob' },
          ]),
        ),
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
    it('computes a rank for each game entry via one aggregation', async () => {
      const aggregate = jest.fn().mockReturnValue(
        chain([
          { gameId: 'chess_v1', elo: 1600, count: 7 },
          { gameId: 'chess_v1', elo: 1551, count: 5 },
        ]),
      );
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
        aggregate,
      });
      const service = buildService(rankingModel, makeModel(), makeModel());

      const rows = await service.getMyRankings('user1');

      // One aggregation round-trip instead of a countDocuments per game.
      expect(aggregate).toHaveBeenCalledTimes(1);
      const pipeline = (
        aggregate.mock.calls as unknown as Array<[Record<string, unknown>]>
      )[0]?.[0];
      expect(pipeline).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            $match: {
              season,
              gameId: { $in: ['chess_v1'] },
            },
          }),
        ]),
      );
      // 12 players above 1550 -> rank 13.
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

    it('returns [] without hitting the aggregation when no entries exist', async () => {
      const aggregate = jest.fn();
      const rankingModel = makeModel({
        find: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockReturnValue(chain([])),
          }),
        }),
        aggregate,
      });
      const service = buildService(rankingModel, makeModel(), makeModel());

      const rows = await service.getMyRankings('user1');

      expect(rows).toEqual([]);
      expect(aggregate).not.toHaveBeenCalled();
    });
  });
});

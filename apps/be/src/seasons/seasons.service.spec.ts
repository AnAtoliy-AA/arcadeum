import { SeasonsService } from './seasons.service';
import { Season } from './schemas/season.schema';
import { RankingEntry } from '../ranking/ranking.schema';
import { User } from '../auth/schemas/user.schema';
import type { Model } from 'mongoose';
import {
  seasonEndFor,
  seasonIdFor,
  seasonNumberFor,
  seasonStartFor,
  softResetRating,
  themeForSeason,
} from './seasons.constants';

type AnyModel = {
  findOne: jest.Mock;
  findOneAndUpdate: jest.Mock;
  find: jest.Mock;
  updateOne: jest.Mock;
  aggregate: jest.Mock;
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
    findOneAndUpdate: jest
      .fn()
      .mockImplementation(
        (_q: unknown, _u: unknown, opts?: { new?: boolean }) => ({
          lean: jest
            .fn()
            .mockReturnValue(chain(opts?.new ? makeLeanSeason() : null)),
        }),
      ),
    find: jest.fn().mockImplementation(() => createChainableQuery([])),
    updateOne: jest.fn().mockReturnValue(chain({})),
    aggregate: jest.fn().mockReturnValue(chain([{ entries: [], total: [] }])),
    ...overrides,
  };
}

function makeLeanSeason(overrides: Record<string, unknown> = {}) {
  const seasonId = seasonIdFor();
  return {
    _id: '507f1f77bcf86cd799439011',
    seasonId,
    number: seasonNumberFor(seasonId),
    status: 'active',
    theme: themeForSeason(seasonId),
    startsAt: seasonStartFor(seasonId),
    endsAt: seasonEndFor(seasonId),
    rewardTiers: [],
    champions: [],
    archivedAt: null,
    ...overrides,
  };
}

function buildService(
  seasonModel: AnyModel,
  rankingModel: AnyModel = makeModel(),
  userModel: AnyModel = makeModel(),
): SeasonsService {
  return new SeasonsService(
    seasonModel as unknown as Model<Season>,
    rankingModel as unknown as Model<RankingEntry>,
    userModel as unknown as Model<User>,
  );
}

describe('seasons constants', () => {
  it('maps quarters to ids, numbers, and windows', () => {
    expect(seasonIdFor(new Date('2026-07-16T12:00:00Z'))).toBe('2026Q3');
    expect(seasonNumberFor('2026Q1')).toBe(1);
    expect(seasonNumberFor('2026Q3')).toBe(3);
    expect(seasonNumberFor('2027Q1')).toBe(5);
    expect(seasonStartFor('2026Q3').toISOString()).toBe(
      '2026-07-01T00:00:00.000Z',
    );
    expect(seasonEndFor('2026Q3').toISOString()).toBe(
      '2026-10-01T00:00:00.000Z',
    );
  });

  it('cycles themes deterministically per quarter', () => {
    expect(themeForSeason('2026Q1')).toBe(themeForSeason('2028Q1'));
    expect(themeForSeason('2026Q2')).not.toBe(themeForSeason('2026Q1'));
  });

  it('soft-resets ratings toward the anchor', () => {
    // Roadmap defaults: pull toward 1500 with factor 0.5.
    expect(softResetRating(1500)).toBe(1500);
    expect(softResetRating(1200)).toBe(1350);
    expect(softResetRating(2000)).toBe(1750);
    // Factor/anchor overrides.
    expect(softResetRating(1400, 1500, 0)).toBe(1500);
    expect(softResetRating(1400, 1200, 1)).toBe(1400);
  });
});

describe('SeasonsService', () => {
  describe('rollOverIfNeeded', () => {
    it('creates the current season when missing', async () => {
      const seasonModel = makeModel();
      const service = buildService(seasonModel);

      await service.rollOverIfNeeded();

      expect(seasonModel.findOneAndUpdate).toHaveBeenCalledTimes(1);
      const [filter, update] = seasonModel.findOneAndUpdate.mock
        .calls[0] as unknown as [
        Record<string, unknown>,
        { $setOnInsert: { status: string; rewardTiers: unknown[] } },
      ];
      expect(filter).toEqual({ seasonId: seasonIdFor() });
      expect(update.$setOnInsert.status).toBe('active');
      expect(update.$setOnInsert.rewardTiers.length).toBeGreaterThan(0);
    });

    it('archives ended active seasons and crowns champions', async () => {
      const stale = makeLeanSeason({
        seasonId: '2026Q1',
        status: 'active',
        endsAt: seasonEndFor('2026Q1'),
      });
      const seasonModel = makeModel({
        find: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue(chain([stale])),
        }),
      });
      const rankingModel = makeModel({
        aggregate: jest.fn().mockReturnValue(
          chain([
            { _id: 'chess_v1', userId: '507f1f77bcf86cd799439011', elo: 1720 },
            { _id: 'go_v1', userId: 'not-an-objectid', elo: 1600 },
          ]),
        ),
      });
      const userModel = makeModel({
        find: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            lean: jest
              .fn()
              .mockReturnValue(
                chain([{ _id: '507f1f77bcf86cd799439011', username: 'alice' }]),
              ),
          }),
        }),
      });
      const service = buildService(seasonModel, rankingModel, userModel);

      await service.rollOverIfNeeded();
      const updateCalls = seasonModel.updateOne.mock.calls as unknown as Array<
        [
          Record<string, unknown>,
          {
            $set: {
              status?: string;
              champions: Array<Record<string, unknown>>;
            };
          },
        ]
      >;
      expect(updateCalls).toHaveLength(1);
      const [updateFilter, updateUpdate] = updateCalls[0];
      expect(updateFilter).toEqual({ seasonId: '2026Q1', status: 'active' });
      expect(updateUpdate.$set.status).toBe('archived');
      expect(updateUpdate.$set.champions).toEqual([
        {
          gameId: 'chess_v1',
          userId: '507f1f77bcf86cd799439011',
          username: 'alice',
          elo: 1720,
        },
        {
          gameId: 'go_v1',
          userId: 'not-an-objectid',
          username: null,
          elo: 1600,
        },
      ]);
    });

    it('does nothing when the current season already exists', async () => {
      const seasonModel = makeModel({
        findOne: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue(chain(makeLeanSeason())),
        }),
      });
      const service = buildService(seasonModel);

      await service.rollOverIfNeeded();

      expect(seasonModel.findOneAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentSeason', () => {
    it('returns the mapped view with ISO dates', async () => {
      const lean = makeLeanSeason();
      const service = buildService(
        makeModel({
          findOne: jest.fn().mockReturnValue({
            lean: jest.fn().mockReturnValue(chain(lean)),
          }),
        }),
      );

      const view = await service.getCurrentSeason();

      expect(view.id).toBe(lean.seasonId);
      expect(view.number).toBe(lean.number);
      expect(view.status).toBe('active');
      expect(view.startsAt).toBe(lean.startsAt.toISOString());
      expect(view.endsAt).toBe(lean.endsAt.toISOString());
      expect(view.champions).toEqual([]);
    });
  });

  describe('getLeaderboard', () => {
    it('rejects malformed season ids with an empty board', async () => {
      const rankingModel = makeModel();
      const service = buildService(makeModel(), rankingModel);

      const snapshot = await service.getLeaderboard('not-a-season');

      expect(snapshot.total).toBe(0);
      expect(snapshot.entries).toEqual([]);
      expect(rankingModel.aggregate).not.toHaveBeenCalled();
    });

    it('ranks aggregated entries and hydrates usernames', async () => {
      const rankingModel = makeModel({
        aggregate: jest.fn().mockReturnValue(
          chain([
            {
              entries: [
                {
                  _id: '507f1f77bcf86cd799439011',
                  elo: 1800,
                  wins: 12,
                  rankedGames: 20,
                },
                {
                  _id: '507f1f77bcf86cd799439022',
                  elo: 1650,
                  wins: 9,
                  rankedGames: 15,
                },
              ],
              total: [{ count: 2 }],
            },
          ]),
        ),
      });
      const userModel = makeModel({
        find: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            lean: jest
              .fn()
              .mockReturnValue(
                chain([{ _id: '507f1f77bcf86cd799439011', username: 'alice' }]),
              ),
          }),
        }),
      });
      const service = buildService(makeModel(), rankingModel, userModel);

      const snapshot = await service.getLeaderboard('2026Q3', { limit: 2 });

      expect(snapshot.seasonId).toBe('2026Q3');
      expect(snapshot.total).toBe(2);
      expect(snapshot.entries[0]).toMatchObject({
        rank: 1,
        username: 'alice',
        elo: 1800,
      });
      expect(snapshot.entries[1].username).toBe('507f1f77bcf86cd799439022');
    });

    it('clamps pagination bounds', async () => {
      const rankingModel = makeModel();
      const service = buildService(makeModel(), rankingModel);

      await service.getLeaderboard('2026Q3', { limit: 1000, offset: -50 });

      const [pipeline] = rankingModel.aggregate.mock.calls[0] as unknown as [
        Array<Record<string, unknown>>,
      ];
      const facet = pipeline.find((s) => '$facet' in s);
      const entryStages = (
        facet?.['$facet'] as { entries: Array<Record<string, unknown>> }
      ).entries;
      expect(entryStages).toContainEqual({ $skip: 0 });
      expect(entryStages.find((s) => s.$limit)).toEqual({ $limit: 100 });
    });
  });

  describe('getSeasonById', () => {
    it('rejects invalid ids without hitting the database', async () => {
      const seasonModel = makeModel();
      const service = buildService(seasonModel);

      expect(await service.getSeasonById('../etc-passwd')).toBeNull();
      expect(seasonModel.findOne).not.toHaveBeenCalled();
    });

    it('returns archived detail with champion views', async () => {
      const lean = makeLeanSeason({
        status: 'archived',
        archivedAt: new Date('2026-04-01T00:00:00Z'),
        champions: [
          {
            gameId: 'chess_v1',
            userId: '507f1f77bcf86cd799439011',
            username: 'alice',
            elo: 1900,
          },
        ],
      });
      const service = buildService(
        makeModel({
          findOne: jest.fn().mockReturnValue({
            lean: jest.fn().mockReturnValue(chain(lean)),
          }),
        }),
      );

      const detail = await service.getSeasonById('2026Q1');

      expect(detail?.status).toBe('archived');
      expect(detail?.archivedAt).toBe('2026-04-01T00:00:00.000Z');
      expect(detail?.champions[0]).toMatchObject({
        gameId: 'chess_v1',
        userId: '507f1f77bcf86cd799439011',
        username: 'alice',
      });
    });
  });

  describe('listSeasons', () => {
    it('clamps the requested limit', async () => {
      const query = createChainableQuery([]);
      const seasonModel = makeModel({
        find: jest.fn().mockReturnValue(query),
      });
      const service = buildService(seasonModel);

      await service.listSeasons(100_000);

      expect(query.limit).toHaveBeenCalledWith(50);
      expect(query.sort).toHaveBeenCalledWith({ endsAt: -1 });
    });
  });
});

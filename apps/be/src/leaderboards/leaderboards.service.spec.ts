import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { LeaderboardsService } from './leaderboards.service';
import { LeaderboardsGateway } from './leaderboards.gateway';
import { LeaderboardsCacheService } from './leaderboards.cache';
import { LeaderboardEntry } from './schemas/leaderboard-entry.schema';
import { Cup } from './schemas/cup.schema';
import { Squad } from './schemas/squad.schema';
import { TickerEvent } from './schemas/ticker-event.schema';

function makeQuery<T>(result: T) {
  return {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(result),
  };
}

const baseEntry = {
  userId: 'p_1',
  username: 'Nightblade',
  region: 'eu',
  countryCode: 'de',
  tier: 'mythic',
  rating: 2870,
  elo: 2950,
  wins: 100,
  losses: 25,
  draws: 5,
  recentForm: ['W', 'W', 'L', 'W', 'W', 'D', 'W', 'W', 'W', 'L', 'W', 'W'],
  streak: 11,
  isOnline: true,
  isInMatch: false,
  gameTags: ['Mafia'],
};

const secondEntry = {
  ...baseEntry,
  userId: 'p_2',
  username: 'Frostbyte',
  rating: 2806,
  streak: 4,
};

const thirdEntry = {
  ...baseEntry,
  userId: 'p_3',
  username: 'VoidPriest',
  rating: 2750,
  streak: 0,
};

describe('LeaderboardsService', () => {
  let service: LeaderboardsService;
  let entryModel: Record<string, jest.Mock>;
  let cupModel: Record<string, jest.Mock>;
  let squadModel: Record<string, jest.Mock>;
  let tickerModel: Record<string, jest.Mock>;
  let module: TestingModule;

  beforeEach(async () => {
    entryModel = {
      find: jest.fn(),
      findOne: jest.fn(),
      countDocuments: jest.fn(),
      aggregate: jest.fn(),
    };
    cupModel = {
      findOne: jest.fn(),
    };
    squadModel = {
      find: jest.fn(),
    };
    tickerModel = {
      find: jest.fn(),
    };

    module = await Test.createTestingModule({
      providers: [
        LeaderboardsService,
        {
          provide: getModelToken(LeaderboardEntry.name),
          useValue: entryModel,
        },
        { provide: getModelToken(Cup.name), useValue: cupModel },
        { provide: getModelToken(Squad.name), useValue: squadModel },
        { provide: getModelToken(TickerEvent.name), useValue: tickerModel },
        {
          provide: LeaderboardsGateway,
          useValue: { emitCaptured: jest.fn(), emitEntryUpdated: jest.fn() },
        },
        LeaderboardsCacheService,
      ],
    }).compile();

    service = module.get(LeaderboardsService);
  });

  afterAll(async () => {
    await module.close();
  });

  function wireDefaultMocks(
    rows: (typeof baseEntry)[] = [baseEntry, secondEntry, thirdEntry],
  ) {
    entryModel.find
      .mockReturnValueOnce(makeQuery(rows)) // top page
      .mockReturnValueOnce(makeQuery(rows)) // climbers
      .mockReturnValueOnce(makeQuery(rows)); // fallers
    entryModel.findOne.mockReturnValue(makeQuery(rows[0])); // topRow / self
    entryModel.countDocuments.mockReturnValue({
      exec: jest.fn().mockResolvedValue(rows.length),
    });
    entryModel.aggregate.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        { _id: 'eu', count: 2 },
        { _id: 'na', count: 1 },
      ]),
    });
    cupModel.findOne.mockReturnValue(makeQuery(null));
    squadModel.find.mockReturnValue(makeQuery([]));
    tickerModel.find.mockReturnValue(makeQuery([]));
  }

  it('returns the top row as mythic with rating delta', async () => {
    wireDefaultMocks();
    const snap = await service.getSnapshot({ mode: 'all' });
    expect(snap.mythic).not.toBeNull();
    expect(snap.mythic?.id).toBe('p_1');
    expect(snap.mythic?.ratingDelta).toBe(2870 - 2806);
  });

  it('renders rows with sequential ranks starting from page offset', async () => {
    wireDefaultMocks();
    const snap = await service.getSnapshot({
      mode: 'all',
      page: 2,
      pageSize: 10,
    });
    expect(snap.rows[0]?.rank).toBe(11);
  });

  it('aggregates region distribution into shares that sum to ~1', async () => {
    wireDefaultMocks();
    const snap = await service.getSnapshot({ mode: 'all' });
    const totalShare = snap.regions.reduce((acc, r) => acc + r.share, 0);
    expect(totalShare).toBeGreaterThan(0.99);
    expect(totalShare).toBeLessThan(1.01);
  });

  it('returns no self when selfUserId is not provided', async () => {
    wireDefaultMocks();
    const snap = await service.getSnapshot({ mode: 'all' });
    expect(snap.self).toBeNull();
  });

  it('returns self entry when selfUserId resolves to a row', async () => {
    wireDefaultMocks();
    entryModel.findOne
      .mockReturnValueOnce(makeQuery(baseEntry)) // topRow
      .mockReturnValueOnce(
        makeQuery({ ...baseEntry, userId: 'me', rank: 247 }),
      );
    const snap = await service.getSnapshot({ mode: 'all', selfUserId: 'me' });
    expect(snap.self?.id).toBe('me');
    expect(snap.self?.rank).toBe(247);
  });

  it('markInMatch updates entries and emits per user when mode is given', async () => {
    entryModel.updateMany = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ modifiedCount: 2 }),
    });
    const matched = await service.markInMatch(['u1', 'u2'], true, 'mafia');
    expect(matched).toBe(2);
    expect(entryModel.updateMany).toHaveBeenCalledWith(
      { userId: { $in: ['u1', 'u2'] }, mode: 'mafia' },
      { $set: { isInMatch: true } },
    );
  });

  it('markInMatch is a no-op for empty user list', async () => {
    entryModel.updateMany = jest.fn();
    const matched = await service.markInMatch([], true, 'mafia');
    expect(matched).toBe(0);
    expect(entryModel.updateMany).not.toHaveBeenCalled();
  });
});

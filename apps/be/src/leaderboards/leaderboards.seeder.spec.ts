import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { LeaderboardsSeederService } from './leaderboards.seeder';
import { LeaderboardEntry } from './schemas/leaderboard-entry.schema';
import { Cup } from './schemas/cup.schema';
import { Squad } from './schemas/squad.schema';
import { TickerEvent } from './schemas/ticker-event.schema';

describe('LeaderboardsSeederService', () => {
  let service: LeaderboardsSeederService;
  let entryModel: Record<string, jest.Mock>;
  let cupModel: Record<string, jest.Mock>;
  let squadModel: Record<string, jest.Mock>;
  let tickerModel: Record<string, jest.Mock>;
  let module: TestingModule;

  beforeEach(async () => {
    entryModel = {
      deleteMany: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      }),
      insertMany: jest.fn().mockResolvedValue([]),
      countDocuments: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      }),
    };
    cupModel = {
      deleteMany: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      }),
      create: jest.fn().mockResolvedValue({}),
    };
    squadModel = {
      deleteMany: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      }),
      insertMany: jest
        .fn()
        .mockImplementation((docs: unknown[]) => Promise.resolve(docs)),
    };
    tickerModel = {
      deleteMany: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      }),
      insertMany: jest
        .fn()
        .mockImplementation((docs: unknown[]) => Promise.resolve(docs)),
    };

    module = await Test.createTestingModule({
      providers: [
        LeaderboardsSeederService,
        {
          provide: getModelToken(LeaderboardEntry.name),
          useValue: entryModel,
        },
        { provide: getModelToken(Cup.name), useValue: cupModel },
        { provide: getModelToken(Squad.name), useValue: squadModel },
        { provide: getModelToken(TickerEvent.name), useValue: tickerModel },
      ],
    }).compile();

    service = module.get(LeaderboardsSeederService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('clears the season then inserts modes × rowsPerMode entries', async () => {
    const summary = await service.seed({
      rowsPerMode: 10,
      season: '2026Q2',
    });

    expect(entryModel.deleteMany).toHaveBeenCalledWith({ season: '2026Q2' });
    expect(entryModel.insertMany).toHaveBeenCalledTimes(1);
    expect(summary.entriesInserted).toBe(summary.modes.length * 10);
    expect(summary.modes.length).toBeGreaterThanOrEqual(2);
    expect(summary.cupsInserted).toBe(1);
    expect(summary.squadsInserted).toBe(5);
    expect(summary.tickerEventsInserted).toBe(4);
  });

  it('seeded ticker events do not carry expiresAt (ARC-594)', async () => {
    let inserted: Array<Record<string, unknown>> = [];
    tickerModel.insertMany.mockImplementation(
      (docs: Array<Record<string, unknown>>) => {
        inserted = docs;
        return Promise.resolve(docs);
      },
    );

    await service.seed({ rowsPerMode: 4, season: '2026Q2' });

    expect(inserted).toHaveLength(4);
    for (const doc of inserted) {
      expect(doc).not.toHaveProperty('expiresAt');
    }
  });

  it('seedIfEmpty inserts when the season has no entries', async () => {
    entryModel.countDocuments = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(0),
    });
    const summary = await service.seedIfEmpty({
      rowsPerMode: 5,
      season: '2026Q2',
    });
    expect(summary).not.toBeNull();
    expect(entryModel.insertMany).toHaveBeenCalled();
  });

  it('seedIfEmpty is a no-op when the season already has entries', async () => {
    entryModel.countDocuments = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(42),
    });
    const summary = await service.seedIfEmpty({ season: '2026Q2' });
    expect(summary).toBeNull();
    expect(entryModel.insertMany).not.toHaveBeenCalled();
  });

  it('produces unique userIds across (mode, rank) pairs', async () => {
    let inserted: Array<{ userId?: string }> = [];
    entryModel.insertMany.mockImplementation(
      (docs: Array<{ userId?: string }>) => {
        inserted = docs;
        return Promise.resolve(docs);
      },
    );

    await service.seed({ rowsPerMode: 5 });

    const ids = inserted.map((d) => d.userId);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

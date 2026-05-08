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

  it('clears the season then inserts 5 modes × rowsPerMode entries', async () => {
    const summary = await service.seed({
      rowsPerMode: 10,
      season: '2026Q2',
    });

    expect(entryModel.deleteMany).toHaveBeenCalledWith({ season: '2026Q2' });
    expect(entryModel.insertMany).toHaveBeenCalledTimes(1);
    expect(summary.entriesInserted).toBe(50);
    expect(summary.modes).toHaveLength(5);
    expect(summary.cupsInserted).toBe(1);
    expect(summary.squadsInserted).toBe(5);
    expect(summary.tickerEventsInserted).toBe(4);
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

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { LeaderboardsCaptureService } from './leaderboards.capture.service';
import { LeaderboardsGateway } from './leaderboards.gateway';
import { LeaderboardsCacheService } from './leaderboards.cache';
import { LeaderboardEntry } from './schemas/leaderboard-entry.schema';

describe('LeaderboardsCaptureService', () => {
  let service: LeaderboardsCaptureService;
  let entryModel: Record<string, jest.Mock>;
  let gateway: { emitCaptured: jest.Mock };
  let cache: { invalidateAll: jest.Mock };
  let module: TestingModule;

  beforeEach(async () => {
    entryModel = {
      find: jest.fn(),
      bulkWrite: jest.fn(),
    };
    gateway = { emitCaptured: jest.fn() };
    cache = { invalidateAll: jest.fn() };

    module = await Test.createTestingModule({
      providers: [
        LeaderboardsCaptureService,
        {
          provide: getModelToken(LeaderboardEntry.name),
          useValue: entryModel,
        },
        { provide: LeaderboardsGateway, useValue: gateway },
        { provide: LeaderboardsCacheService, useValue: cache },
      ],
    }).compile();

    service = module.get(LeaderboardsCaptureService);
  });

  afterEach(async () => {
    await module.close();
  });

  function wireFind(rows: { _id: string; rank?: number }[]) {
    return {
      sort: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(rows),
    };
  }

  it('assigns sequential ranks and copies prevRank from previous rank', async () => {
    entryModel.find.mockReturnValue(
      wireFind([
        { _id: 'a', rank: 1 },
        { _id: 'b', rank: 2 },
        { _id: 'c' }, // first capture, no prior rank
      ]),
    );
    entryModel.bulkWrite.mockResolvedValue({ modifiedCount: 3 });

    const res = await service.capture('all', '2026Q2');

    expect(res.updated).toBe(3);
    const calls = entryModel.bulkWrite.mock.calls as unknown[][];
    const ops = calls[0]?.[0] as Array<{
      updateOne: {
        filter: { _id: string };
        update: { $set: { rank: number; prevRank: number } };
      };
    }>;
    expect(ops[0]?.updateOne.update.$set).toEqual({ rank: 1, prevRank: 1 });
    expect(ops[1]?.updateOne.update.$set).toEqual({ rank: 2, prevRank: 2 });
    // Third entry had no prior rank — prevRank seeds to its new rank.
    expect(ops[2]?.updateOne.update.$set).toEqual({ rank: 3, prevRank: 3 });
  });

  it('returns 0 updates and skips bulkWrite when there are no entries', async () => {
    entryModel.find.mockReturnValue(wireFind([]));
    const res = await service.capture('all', '2026Q2');
    expect(res.updated).toBe(0);
    expect(entryModel.bulkWrite).not.toHaveBeenCalled();
  });

  it('captureAll iterates all modes, invalidates cache, and emits', async () => {
    entryModel.find.mockReturnValue(wireFind([]));
    const all = await service.captureAll();
    expect(all).toHaveLength(5); // all modes
    expect(cache.invalidateAll).toHaveBeenCalledTimes(1);
    expect(gateway.emitCaptured).toHaveBeenCalledWith(all);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { LeaderboardsService } from './leaderboards.service';
import { LeaderboardsGateway } from './leaderboards.gateway';
import { LeaderboardsCacheService } from './leaderboards.cache';
import { LeaderboardEntry } from './schemas/leaderboard-entry.schema';
import { Cup } from './schemas/cup.schema';
import { Squad } from './schemas/squad.schema';
import { TickerEvent } from './schemas/ticker-event.schema';
import { User } from '../auth/schemas/user.schema';
import { GameHistoryStatsService } from '../games/history/game-history-stats.service';
import { FriendsService } from '../friends/friends.service';

function makeQuery<T>(result: T) {
  return {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(result),
  };
}

function realEntry(
  rank: number,
  playerId: string,
  username: string,
  wins: number,
  losses: number,
) {
  const totalGames = wins + losses;
  const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
  return { rank, playerId, username, totalGames, wins, losses, winRate };
}

const realBoard = {
  entries: [
    realEntry(1, 'p_1', 'Nightblade', 80, 20),
    realEntry(2, 'p_2', 'Frostbyte', 70, 25),
    realEntry(3, 'p_3', 'VoidPriest', 65, 30),
    realEntry(4, 'p_4', 'EmberQueen', 60, 35),
  ],
  hasMore: false,
  total: 4,
};

describe('LeaderboardsService', () => {
  let service: LeaderboardsService;
  let entryModel: Record<string, jest.Mock>;
  let cupModel: Record<string, jest.Mock>;
  let squadModel: Record<string, jest.Mock>;
  let tickerModel: Record<string, jest.Mock>;
  let userModel: Record<string, jest.Mock>;
  let historyStats: { getLeaderboard: jest.Mock };
  let module: TestingModule;

  beforeEach(async () => {
    entryModel = { find: jest.fn(), findOne: jest.fn(), updateMany: jest.fn() };
    cupModel = { findOne: jest.fn() };
    squadModel = { find: jest.fn(), findOne: jest.fn() };
    tickerModel = { find: jest.fn() };
    // findById returns null for the bot-id test fixtures; getPlayer falls
    // back to null equipped IDs. Real-user cases set this explicitly.
    userModel = {
      findById: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      }),
    };
    historyStats = {
      getLeaderboard: jest.fn().mockResolvedValue(realBoard),
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
        { provide: getModelToken(User.name), useValue: userModel },
        {
          provide: LeaderboardsGateway,
          useValue: { emitCaptured: jest.fn(), emitEntryUpdated: jest.fn() },
        },
        LeaderboardsCacheService,
        { provide: GameHistoryStatsService, useValue: historyStats },
        {
          provide: FriendsService,
          useValue: { getFriendIds: jest.fn().mockResolvedValue([]) },
        },
      ],
    }).compile();

    service = module.get(LeaderboardsService);
  });

  afterAll(async () => {
    await module.close();
  });

  function wireFlavor() {
    cupModel.findOne.mockReturnValue(makeQuery(null));
    squadModel.find.mockReturnValue(makeQuery([]));
    tickerModel.find.mockReturnValue(makeQuery([]));
  }

  it('forwards the mode-to-gameId mapping when fetching real stats', async () => {
    wireFlavor();
    await service.getSnapshot({ mode: 'critical' });
    expect(historyStats.getLeaderboard).toHaveBeenCalledWith(
      expect.any(Number),
      0,
      'critical_v1',
    );
  });

  it('returns no gameId filter for the all-modes leaderboard', async () => {
    wireFlavor();
    await service.getSnapshot({ mode: 'all' });
    expect(historyStats.getLeaderboard).toHaveBeenCalledWith(
      expect.any(Number),
      0,
      undefined,
    );
  });

  it('hydrates rows from the real leaderboard with mythic on top', async () => {
    wireFlavor();
    const snap = await service.getSnapshot({ mode: 'all' });
    expect(snap.rows.length).toBe(4);
    expect(snap.rows[0]?.id).toBe('p_1');
    expect(snap.mythic?.id).toBe('p_1');
    const r0 = snap.rows[0]?.rating ?? 0;
    const r1 = snap.rows[1]?.rating ?? 0;
    expect(snap.mythic?.ratingDelta).toBe(r0 - r1);
  });

  it('paginates with sequential ranks honoring page offset', async () => {
    wireFlavor();
    const snap = await service.getSnapshot({
      mode: 'all',
      page: 2,
      pageSize: 2,
    });
    expect(snap.rows[0]?.rank).toBe(3);
    expect(snap.rows[0]?.id).toBe('p_3');
  });

  it('filters rows by username substring (case-insensitive)', async () => {
    wireFlavor();
    const snap = await service.getSnapshot({ mode: 'all', q: 'NIGHT' });
    expect(snap.rows.length).toBe(1);
    expect(snap.rows[0]?.id).toBe('p_1');
    expect(snap.totalRows).toBe(1);
  });

  it('returns no self when selfUserId is not provided', async () => {
    wireFlavor();
    const snap = await service.getSnapshot({ mode: 'all' });
    expect(snap.self).toBeNull();
  });

  it('returns self entry when selfUserId matches a real row', async () => {
    wireFlavor();
    const snap = await service.getSnapshot({ mode: 'all', selfUserId: 'p_2' });
    expect(snap.self?.id).toBe('p_2');
    expect(snap.self?.rank).toBe(2);
  });

  it('markInMatch updates entries and emits per user when mode is given', async () => {
    entryModel.updateMany = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ modifiedCount: 2 }),
    });
    const matched = await service.markInMatch(['u1', 'u2'], true, 'critical');
    expect(matched).toBe(2);
    expect(entryModel.updateMany).toHaveBeenCalledWith(
      { userId: { $in: ['u1', 'u2'] }, mode: 'critical' },
      { $set: { isInMatch: true } },
    );
  });

  it('markInMatch is a no-op for empty user list', async () => {
    entryModel.updateMany = jest.fn();
    const matched = await service.markInMatch([], true, 'critical');
    expect(matched).toBe(0);
    expect(entryModel.updateMany).not.toHaveBeenCalled();
  });

  it('getPlayer returns null when no leaderboards contain the user', async () => {
    historyStats.getLeaderboard.mockResolvedValue({
      entries: [],
      hasMore: false,
      total: 0,
    });
    squadModel.findOne.mockReturnValue(makeQuery(null));
    const profile = await service.getPlayer('ghost');
    expect(profile).toBeNull();
  });

  it('getPlayer aggregates per-mode ranks for a known user', async () => {
    historyStats.getLeaderboard.mockImplementation(
      (_l: number, _o: number, gameId?: string) => {
        if (!gameId)
          return Promise.resolve({
            entries: [realEntry(247, 'me', 'Me', 50, 50)],
            hasMore: false,
            total: 1,
          });
        if (gameId === 'critical_v1')
          return Promise.resolve({
            entries: [realEntry(12, 'me', 'Me', 30, 10)],
            hasMore: false,
            total: 1,
          });
        return Promise.resolve({ entries: [], hasMore: false, total: 0 });
      },
    );
    squadModel.findOne.mockReturnValue(
      makeQuery({
        squadId: 'sq_1',
        name: 'Ember Pact',
        tag: 'EMBR',
        rating: 9720,
        memberCount: 7,
        rank: 2,
      }),
    );
    const profile = await service.getPlayer('me');
    expect(profile?.player.id).toBe('me');
    expect(profile?.modeRanks.length).toBe(2);
    expect(profile?.modeRanks.find((m) => m.mode === 'critical')?.rank).toBe(
      12,
    );
    expect(profile?.squad?.tag).toBe('EMBR');
  });
});

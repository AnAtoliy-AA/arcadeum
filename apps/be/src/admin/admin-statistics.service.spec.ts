import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AdminStatisticsService } from './admin-statistics.service';
import { User } from '../auth/schemas/user.schema';
import { GameSession } from '../games/schemas/game-session.schema';
import { PlayerStatRecord } from '../games/schemas/player-stat-record.schema';
import { GameRoom } from '../games/schemas/game-room.schema';
import { WalletTransaction } from '../wallet/schemas/wallet-transaction.schema';
import { Tournament } from '../tournaments/schemas/tournament.schema';
import { GemPurchase } from '../gems/schemas/gem-purchase.schema';

describe('AdminStatisticsService', () => {
  let service: AdminStatisticsService;

  const mockExec = <T>(val: T) => ({ exec: jest.fn().mockResolvedValue(val) });

  const mockUserModel = {
    countDocuments: jest.fn().mockImplementation(() => mockExec(100)),
    aggregate: jest.fn().mockImplementation(() =>
      mockExec([
        { _id: 'free', count: 80 },
        { _id: 'admin', count: 20 },
      ]),
    ),
    distinct: jest.fn().mockImplementation(() => mockExec(['user1', 'user2'])),
  };

  const mockGameSessionModel = {
    countDocuments: jest.fn().mockImplementation(() => mockExec(10)),
  };

  const mockPlayerStatRecordModel = {
    countDocuments: jest.fn().mockImplementation(() => mockExec(250)),
    distinct: jest
      .fn()
      .mockImplementation(() => mockExec(['user1', 'user2', 'user3'])),
    aggregate: jest.fn().mockImplementation((pipeline: unknown[]) => {
      const isHourly =
        Array.isArray(pipeline) &&
        pipeline.some(
          (stage: Record<string, unknown>) =>
            stage.$project && typeof stage.$project === 'object',
        );
      if (isHourly) {
        return mockExec([{ _id: 14, count: 25 }]);
      }
      return mockExec([
        {
          _id: 'critical_v1',
          totalMatches: 150,
          wins: 70,
          losses: 70,
          draws: 10,
          uniquePlayers: ['user1', 'user2'],
        },
      ]);
    }),
  };

  const mockGameRoomModel = {
    countDocuments: jest.fn().mockImplementation(() => mockExec(5)),
  };

  const mockWalletTxModel = {
    countDocuments: jest.fn().mockImplementation(() => mockExec(400)),
    aggregate: jest
      .fn()
      .mockImplementation(() =>
        mockExec([{ _id: 'faucet', count: 200, volume: 5000 }]),
      ),
  };

  const mockTournamentModel = {
    countDocuments: jest.fn().mockImplementation(() => mockExec(12)),
    aggregate: jest
      .fn()
      .mockImplementation(() => mockExec([{ totalRegs: 48 }])),
  };

  const mockGemPurchaseModel = {
    aggregate: jest
      .fn()
      .mockImplementation(() => mockExec([{ count: 15, totalCents: 15000 }])),
    distinct: jest.fn().mockImplementation(() => mockExec(['user1'])),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminStatisticsService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
        {
          provide: getModelToken(GameSession.name),
          useValue: mockGameSessionModel,
        },
        {
          provide: getModelToken(PlayerStatRecord.name),
          useValue: mockPlayerStatRecordModel,
        },
        { provide: getModelToken(GameRoom.name), useValue: mockGameRoomModel },
        {
          provide: getModelToken(WalletTransaction.name),
          useValue: mockWalletTxModel,
        },
        {
          provide: getModelToken(Tournament.name),
          useValue: mockTournamentModel,
        },
        {
          provide: getModelToken(GemPurchase.name),
          useValue: mockGemPurchaseModel,
        },
      ],
    }).compile();

    service = module.get<AdminStatisticsService>(AdminStatisticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should compute full statistics response with DAU, MAU, games, economy, tournaments and trends', async () => {
    const stats = await service.getStatistics();

    expect(stats).toBeDefined();
    expect(stats.timestamp).toBeDefined();

    expect(stats.users.totalUsers).toBe(100);
    expect(stats.users.dau).toBeGreaterThanOrEqual(1);
    expect(stats.users.mau).toBeGreaterThanOrEqual(1);
    expect(stats.users.stickinessRate).toBeGreaterThanOrEqual(0);
    expect(stats.users.stickyFactorDauMau).toBeGreaterThanOrEqual(0);
    expect(stats.users.stickyFactorDauWau).toBeGreaterThanOrEqual(0);
    expect(stats.users.stickyFactorWauMau).toBeGreaterThanOrEqual(0);
    expect(stats.users.avgPlaytimePerActiveUserMinutes).toBeGreaterThanOrEqual(
      0,
    );
    expect(stats.users.arpu).toBeGreaterThanOrEqual(0);
    expect(stats.users.arppu).toBeGreaterThanOrEqual(0);
    expect(stats.users.anonymous).toBeDefined();
    expect(stats.users.anonymous.anonymousDau).toBeGreaterThanOrEqual(0);
    expect(stats.users.registeredDau).toBeGreaterThanOrEqual(0);
    expect(stats.users.roleBreakdown).toEqual({ free: 80, admin: 20 });

    expect(stats.games.totalGamesPlayed).toBe(250);
    expect(stats.games.byGame).toHaveLength(1);
    expect(stats.games.byGame[0].gameId).toBe('critical_v1');
    expect(stats.games.estimatedPlaytimeHours).toBeGreaterThan(0);
    expect(stats.games.avgMatchDurationMinutes).toBe(7.5);
    expect(stats.games.completionRate).toBeGreaterThan(0);

    expect(stats.economy.totalPurchasesCount).toBe(15);
    expect(stats.economy.totalPurchasesRevenueUsd).toBe(150);
    expect(stats.economy.transactionsCount).toBe(400);

    expect(stats.tournaments.total).toBe(12);
    expect(stats.tournaments.totalRegistrations).toBe(48);

    expect(stats.trends.daily.length).toBe(14);
    expect(stats.trends.hourlyActivity.length).toBe(24);
  });
});

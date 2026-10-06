import { Test, TestingModule } from '@nestjs/testing';
import { GamesHistoryController } from './games.history.controller';
import { GamesService } from './games.service';

describe('GamesHistoryController', () => {
  let controller: GamesHistoryController;
  let gamesService: {
    listHistoryForUser: jest.Mock;
    getPlayerStats: jest.Mock;
    getTrends: jest.Mock;
    getHistoryEntry: jest.Mock;
    getRoomResult: jest.Mock;
    createRematchFromHistory: jest.Mock;
    hideHistoryEntry: jest.Mock;
  };

  beforeEach(async () => {
    gamesService = {
      listHistoryForUser: jest.fn().mockResolvedValue({
        entries: [],
        total: 0,
        page: 0,
        limit: 10,
        hasMore: false,
      }),
      getPlayerStats: jest.fn().mockResolvedValue({
        totalGames: 12,
        wins: 8,
        losses: 4,
        winRate: 66.7,
        byGameType: [],
        currentStreak: 2,
        currentStreakType: 'won',
        bestWinStreak: 5,
        favoriteGame: 'chess',
      }),
      getTrends: jest.fn().mockResolvedValue({
        records: [],
        winRate: 66.7,
        currentStreak: 2,
        currentStreakType: 'won',
      }),
      getHistoryEntry: jest.fn(),
      getRoomResult: jest.fn(),
      createRematchFromHistory: jest.fn(),
      hideHistoryEntry: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamesHistoryController],
      providers: [
        {
          provide: GamesService,
          useValue: gamesService,
        },
        {
          provide: 'CACHE_MANAGER',
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GamesHistoryController>(GamesHistoryController);
  });

  it('should list public history for a user', async () => {
    const result = await controller.listHistoryForUser('u123', '0', '10');
    expect(gamesService.listHistoryForUser).toHaveBeenCalledWith('u123', {
      page: 0,
      limit: 10,
      status: 'completed',
    });
    expect(result).toEqual({
      entries: [],
      total: 0,
      page: 0,
      limit: 10,
      hasMore: false,
    });
  });

  it('should get public stats for a user', async () => {
    const result = await controller.getUserStats('u123');
    expect(gamesService.getPlayerStats).toHaveBeenCalledWith('u123');
    expect(result.totalGames).toBe(12);
  });

  it('should get public trends for a user', async () => {
    const result = await controller.getUserTrends('u123', 'chess', '5');
    expect(gamesService.getTrends).toHaveBeenCalledWith('u123', 'chess', 5);
    expect(result.currentStreak).toBe(2);
  });
});

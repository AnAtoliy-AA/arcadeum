import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ChessPuzzlesService } from './chess-puzzles.service';
import { ChessPuzzle } from './chess-puzzle.schema';
import { ChessPuzzleUser } from './chess-puzzle-user.schema';
import { ChessPuzzleRush } from './chess-puzzle-rush.schema';
import { ChessStockfishService } from '../engine/chess-stockfish.service';
import { OCI_CONNECTION } from '../../../common/providers/mongo-connections.provider';

describe('ChessPuzzlesService - Rush Leaderboard & Runs', () => {
  let service: ChessPuzzlesService;
  let mockRushModel: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    countDocuments: jest.Mock;
  };

  beforeEach(async () => {
    mockRushModel = {
      findOne: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      }),
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([
              {
                userId: 'user_1',
                username: 'TacticalGrandmaster',
                avatar: '',
                score: 25,
                bestStreak: 15,
                totalTimeSeconds: 180,
                rating: 2100,
                createdAt: new Date('2026-10-01T00:00:00.000Z'),
              },
            ]),
          }),
        }),
      }),
      create: jest.fn().mockResolvedValue({}),
      countDocuments: jest.fn().mockResolvedValue(2),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChessPuzzlesService,
        {
          provide: getModelToken(ChessPuzzle.name, OCI_CONNECTION),
          useValue: {},
        },
        {
          provide: getModelToken(ChessPuzzleUser.name, OCI_CONNECTION),
          useValue: {},
        },
        {
          provide: getModelToken(ChessPuzzleRush.name, OCI_CONNECTION),
          useValue: mockRushModel,
        },
        {
          provide: ChessStockfishService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ChessPuzzlesService>(ChessPuzzlesService);
  });

  it('submits a new rush run successfully and calculates rank', async () => {
    const res = await service.submitRushRun(
      { id: 'user_99', username: 'ChessPro' },
      {
        mode: 'timed',
        score: 30,
        bestStreak: 18,
        totalTimeSeconds: 180,
        rating: 1850,
      },
    );

    expect(res.ok).toBe(true);
    expect(res.rank).toBe(3);
    expect(res.bestScore).toBe(30);
    expect(res.isNewBest).toBe(true);
    expect(mockRushModel.create).toHaveBeenCalled();
  });

  it('returns combined leaderboard with real and baseline entries', async () => {
    const lb = await service.getRushLeaderboard('timed', 5);

    expect(lb.length).toBe(5);
    expect(lb[0].username).toBe('BlitzMaster99');
    expect(lb[0].rank).toBe(1);
    expect(lb.some((e) => e.username === 'TacticalGrandmaster')).toBe(true);
  });
});

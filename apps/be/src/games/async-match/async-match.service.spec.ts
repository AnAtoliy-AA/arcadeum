import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { AsyncMatchService } from './async-match.service';
import { AsyncMatch } from './schemas/async-match.schema';

describe('AsyncMatchService', () => {
  let service: AsyncMatchService;
  let matchModel: {
    create: jest.Mock;
    findOne: jest.Mock;
    find: jest.Mock;
  };

  beforeEach(async () => {
    matchModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AsyncMatchService,
        {
          provide: getModelToken(AsyncMatch.name),
          useValue: matchModel,
        },
      ],
    }).compile();

    service = module.get<AsyncMatchService>(AsyncMatchService);
  });

  it('creates an async match with calculated expiration date', async () => {
    const mockCreated = {
      toObject: () => ({
        matchId: 'm-123',
        gameType: 'chess',
        playerA: 'u-1',
        playerB: 'u-2',
        currentTurnPlayerId: 'u-1',
        status: 'active',
      }),
    };
    matchModel.create.mockResolvedValue(mockCreated);

    const result = await service.createMatch('u-1', {
      gameType: 'chess',
      opponentId: 'u-2',
      turnDurationHours: 48,
    });

    expect(result.matchId).toBe('m-123');
    expect(matchModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        gameType: 'chess',
        playerA: 'u-1',
        playerB: 'u-2',
        turnDurationHours: 48,
      }),
    );
  });

  it('rejects match creation against oneself', async () => {
    await expect(
      service.createMatch('u-1', { gameType: 'chess', opponentId: 'u-1' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('submits a valid move and rotates turn to opponent', async () => {
    const futureDate = new Date(Date.now() + 3600000);
    const mockMatchDoc = {
      matchId: 'm-1',
      playerA: 'u-1',
      playerB: 'u-2',
      currentTurnPlayerId: 'u-1',
      status: 'active' as const,
      turnDurationHours: 24,
      turnExpiresAt: futureDate,
      movesHistory: [] as Array<Record<string, unknown>>,
      stateSnapshot: {},
      lastTurnAt: new Date(),
      save: jest.fn().mockResolvedValue(true),
      toObject: () => ({
        matchId: 'm-1',
        playerA: 'u-1',
        playerB: 'u-2',
        currentTurnPlayerId: 'u-2',
        status: 'active' as const,
        turnDurationHours: 24,
        turnExpiresAt: futureDate,
        movesHistory: [],
        stateSnapshot: {},
        lastTurnAt: new Date(),
      }),
    };

    matchModel.findOne.mockResolvedValue(mockMatchDoc);

    const result = await service.submitMove('u-1', 'm-1', {
      move: { from: 'e2', to: 'e4' },
      newStateSnapshot: {
        fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR',
      },
    });

    expect(result.currentTurnPlayerId).toBe('u-2');
    expect(mockMatchDoc.movesHistory).toHaveLength(1);
    expect(mockMatchDoc.save).toHaveBeenCalled();
  });

  it('rejects move submission if not user turn', async () => {
    const mockMatchDoc = {
      matchId: 'm-1',
      playerA: 'u-1',
      playerB: 'u-2',
      currentTurnPlayerId: 'u-2',
      status: 'active',
      turnExpiresAt: new Date(Date.now() + 3600000),
    };

    matchModel.findOne.mockResolvedValue(mockMatchDoc);

    await expect(
      service.submitMove('u-1', 'm-1', {
        move: {},
        newStateSnapshot: {},
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('forfeits match on demand', async () => {
    const mockMatchDoc = {
      matchId: 'm-1',
      playerA: 'u-1',
      playerB: 'u-2',
      status: 'active' as const,
      winnerId: null as string | null,
      save: jest.fn().mockResolvedValue(true),
      toObject: () => ({
        matchId: 'm-1',
        playerA: 'u-1',
        playerB: 'u-2',
        status: 'forfeited' as const,
        winnerId: 'u-2',
        turnDurationHours: 24,
        currentTurnPlayerId: 'u-1',
        movesHistory: [],
        stateSnapshot: {},
        lastTurnAt: new Date(),
        turnExpiresAt: new Date(),
      }),
    };

    matchModel.findOne.mockResolvedValue(mockMatchDoc);

    const res = await service.forfeitMatch('u-1', 'm-1');
    expect(res.status).toBe('forfeited');
    expect(res.winnerId).toBe('u-2');
  });

  it('sweeps expired matches and marks them forfeited', async () => {
    const mockExpiredDoc = {
      matchId: 'm-exp',
      playerA: 'u-1',
      playerB: 'u-2',
      currentTurnPlayerId: 'u-1',
      status: 'active',
      winnerId: null as string | null,
      save: jest.fn().mockResolvedValue(true),
    };

    matchModel.find.mockResolvedValue([mockExpiredDoc]);

    const count = await service.sweepExpiredMatches();
    expect(count).toBe(1);
    expect(mockExpiredDoc.status).toBe('forfeited');
    expect(mockExpiredDoc.winnerId).toBe('u-2');
  });
});

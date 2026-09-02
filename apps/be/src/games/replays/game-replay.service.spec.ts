import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { GameReplayService } from './game-replay.service';
import { GameReplay } from '../schemas/game-replay.schema';
import { User } from '../../auth/schemas/user.schema';
import {
  OCI_CONNECTION,
  ATLAS_CONNECTION,
} from '../../common/providers/mongo-connections.provider';
import type { GameSessionSummary } from '../sessions/game-sessions.service';
import type { GameRoom } from '../schemas/game-room.schema';

const mockReplayModel = {
  create: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
};

const mockUserModel = {
  find: jest.fn(),
};

function createMockSession(
  overrides: Partial<GameSessionSummary> = {},
): GameSessionSummary {
  const emptyBoard: (string | null)[][] = Array.from({ length: 8 }, () =>
    Array<null>(8).fill(null),
  );
  return {
    id: 'session-1',
    roomId: 'room-1',
    gameId: 'chess_v1',
    engine: 'chess_v1',
    status: 'completed',
    state: {
      logs: [
        {
          id: 'log-1',
          type: 'action',
          kind: 'move',
          message: 'e2 to e4',
          createdAt: '2026-01-01T00:01:00Z',
          senderId: 'user-1',
        },
        {
          id: 'log-2',
          type: 'action',
          kind: 'move',
          message: 'e7 to e5',
          createdAt: '2026-01-01T00:02:00Z',
          senderId: 'user-2',
        },
        {
          id: 'log-3',
          type: 'message',
          message: 'Good game!',
          createdAt: '2026-01-01T00:03:00Z',
          senderId: 'user-1',
        },
      ],
      board: emptyBoard,
      gameResult: { winnerIds: ['user-1'], isDraw: false },
    },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:05:00Z',
    ...overrides,
  };
}

function createMockRoom(overrides: Partial<GameRoom> = {}): GameRoom {
  return {
    _id: 'room-1',
    gameId: 'chess_v1',
    hostId: 'user-1',
    name: 'Test Room',
    visibility: 'public',
    status: 'completed',
    participants: [
      { userId: 'user-1', isBot: false },
      { userId: 'user-2', isBot: false },
    ],
    gameOptions: { variant: 'standard' },
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  } as unknown as GameRoom;
}

describe('GameReplayService', () => {
  let service: GameReplayService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameReplayService,
        {
          provide: getModelToken(GameReplay.name, OCI_CONNECTION),
          useValue: mockReplayModel,
        },
        {
          provide: getModelToken(User.name, ATLAS_CONNECTION),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<GameReplayService>(GameReplayService);
  });

  describe('createReplay', () => {
    it('should create a replay from a completed session', async () => {
      const session = createMockSession();
      const room = createMockRoom();

      mockUserModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([
              {
                _id: { toString: () => 'user-1' },
                displayName: 'Alice',
                username: 'alice',
              },
              {
                _id: { toString: () => 'user-2' },
                displayName: 'Bob',
                username: 'bob',
              },
            ]),
          }),
        }),
      });

      mockReplayModel.create.mockResolvedValue({
        replayId: 'test-uuid',
        roomId: 'room-1',
        gameId: 'chess_v1',
        sessionId: 'session-1',
        playerIds: ['user-1', 'user-2'],
        players: [
          { id: 'user-1', displayName: 'Alice' },
          { id: 'user-2', displayName: 'Bob' },
        ],
        initialState: {},
        actions: [
          {
            action: 'move',
            userId: 'user-1',
            payload: { message: 'e2 to e4' },
            timestamp: '2026-01-01T00:01:00Z',
          },
          {
            action: 'move',
            userId: 'user-2',
            payload: { message: 'e7 to e5' },
            timestamp: '2026-01-01T00:02:00Z',
          },
        ],
        result: { winnerIds: ['user-1'], isDraw: false },
        totalMoves: 2,
        durationMs: 300000,
        createdAt: new Date('2026-01-01'),
      });

      const result = await service.createReplay(session, room);

      expect(result).not.toBeNull();
      expect(result?.gameId).toBe('chess_v1');
      expect(result?.totalMoves).toBe(2);
      expect(mockReplayModel.create).toHaveBeenCalledTimes(1);

      const [createArg] = mockReplayModel.create.mock.calls[0] as [
        { actions: unknown[]; playerIds: string[] },
      ];
      expect(createArg.actions).toHaveLength(2);
      expect(createArg.playerIds).toEqual(['user-1', 'user-2']);
    });

    it('should filter out non-action logs', async () => {
      const session = createMockSession();
      const room = createMockRoom();

      mockUserModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      mockReplayModel.create.mockResolvedValue({
        replayId: 'test-uuid',
        roomId: 'room-1',
        gameId: 'chess_v1',
        players: [],
        totalMoves: 2,
        durationMs: 0,
        createdAt: new Date(),
      });

      await service.createReplay(session, room);

      const [createArg] = mockReplayModel.create.mock.calls[0] as [
        { actions: unknown[] },
      ];
      expect(createArg.actions).toHaveLength(2);
    });

    it('should return null when no action logs exist', async () => {
      const session = createMockSession({
        state: {
          logs: [{ id: '1', type: 'message', message: 'hi', createdAt: '' }],
        },
      });
      const room = createMockRoom();

      const result = await service.createReplay(session, room);
      expect(result).toBeNull();
    });

    it('should return null when state has no logs', async () => {
      const session = createMockSession({ state: {} });
      const room = createMockRoom();

      const result = await service.createReplay(session, room);
      expect(result).toBeNull();
    });
  });

  describe('getReplay', () => {
    it('should return replay detail by replayId', async () => {
      const mockReplay = {
        replayId: 'uuid-1',
        roomId: 'room-1',
        sessionId: 'session-1',
        gameId: 'chess_v1',
        playerIds: ['user-1'],
        players: [{ id: 'user-1', displayName: 'Alice' }],
        initialState: { board: [] },
        actions: [],
        result: { winnerIds: ['user-1'], isDraw: false },
        totalMoves: 10,
        durationMs: 60000,
        createdAt: new Date('2026-01-01'),
      };

      mockReplayModel.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockReplay),
        }),
      });

      const result = await service.getReplay('uuid-1');

      expect(result).not.toBeNull();
      expect(result?.replayId).toBe('uuid-1');
      expect(result?.initialState).toBeDefined();
    });

    it('should return null when replay not found', async () => {
      mockReplayModel.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      const result = await service.getReplay('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('listReplays', () => {
    it('should return paginated replays', async () => {
      mockReplayModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(5),
      });
      mockReplayModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue([
                  {
                    replayId: 'r1',
                    roomId: 'room-1',
                    gameId: 'chess_v1',
                    players: [],
                    totalMoves: 5,
                    durationMs: 1000,
                    createdAt: new Date(),
                  },
                ]),
              }),
            }),
          }),
        }),
      });

      const result = await service.listReplays('chess_v1', 0, 10);

      expect(result.total).toBe(5);
      expect(result.entries).toHaveLength(1);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('listReplaysForUser', () => {
    it('should filter replays by userId', async () => {
      mockReplayModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(2),
      });
      mockReplayModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      });

      const result = await service.listReplaysForUser('user-1', 0, 10);

      expect(result.total).toBe(2);
      expect(mockReplayModel.find).toHaveBeenCalledWith({
        playerIds: 'user-1',
      });
    });
  });
});

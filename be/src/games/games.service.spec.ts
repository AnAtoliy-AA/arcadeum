import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { GamesService, type GameSessionSummary } from './games.service';
import { GameRoom } from './schemas/game-room.schema';
import { GameSession } from './schemas/game-session.schema';
import { GamesRealtimeService } from './games.realtime.service';

interface FakeRoomDocument {
  _id: string;
  id: string;
  hostId: string;
  gameId: string;
  status: 'lobby' | 'in_progress' | 'completed';
  playerIds: string[];
  visibility: 'public' | 'private';
  inviteCode?: string;
  maxPlayers?: number;
  createdAt?: Date;
  updatedAt?: Date;
  save: jest.Mock<Promise<FakeRoomDocument>, []>;
}

const createRoomDocument = (overrides: Partial<FakeRoomDocument> = {}) => {
  const base: FakeRoomDocument = {
    _id: 'room-123',
    id: 'room-123',
    hostId: 'host-1',
    gameId: 'exploding-kittens',
    status: 'lobby',
    playerIds: ['host-1', 'guest-2'],
    visibility: 'public',
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z'),
    save: jest
      .fn(function (this: FakeRoomDocument) {
        return Promise.resolve(this);
      })
      .mockName('roomSave') as jest.Mock<Promise<FakeRoomDocument>, []>,
  };

  return Object.assign(base, overrides);
};

describe('GamesService', () => {
  let service: GamesService;
  let gameRoomModel: { findById: jest.Mock };
  let gameSessionModel: Record<string, unknown>;
  let realtime: {
    registerServer: jest.Mock;
    roomChannel: jest.Mock;
    emitRoomUpdate: jest.Mock;
    emitSessionSnapshot: jest.Mock;
    emitSessionSnapshotToClient: jest.Mock;
  };

  beforeEach(async () => {
    gameRoomModel = {
      findById: jest.fn(),
    };

    gameSessionModel = {
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
    };

    realtime = {
      registerServer: jest.fn(),
      roomChannel: jest.fn((roomId: string) => `game-room:${roomId}`),
      emitRoomUpdate: jest.fn(),
      emitSessionSnapshot: jest.fn(),
      emitSessionSnapshotToClient: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesService,
        { provide: getModelToken(GameRoom.name), useValue: gameRoomModel },
        {
          provide: getModelToken(GameSession.name),
          useValue: gameSessionModel,
        },
        { provide: GamesRealtimeService, useValue: realtime },
      ],
    }).compile();

    service = module.get<GamesService>(GamesService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('startExplodingCatsSession', () => {
    it('creates a session and updates the room for a valid host', async () => {
      const roomDoc = createRoomDocument({
        playerIds: ['host-1', ' guest-2 ', 'guest-2'],
      });

      gameRoomModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(roomDoc),
      });

      const sessionSummary: GameSessionSummary = {
        id: 'session-1',
        roomId: roomDoc.id,
        gameId: 'exploding-kittens',
        engine: 'exploding_cats_v1',
        status: 'active',
        state: {},
        createdAt: new Date('2025-01-01T00:00:00.000Z').toISOString(),
        updatedAt: new Date('2025-01-01T00:00:00.000Z').toISOString(),
      };

      let capturedOptions:
        | Parameters<GamesService['createSession']>[0]
        | undefined;
      const createSessionSpy = jest
        .spyOn(service, 'createSession')
        .mockImplementation((options) => {
          capturedOptions = options;
          sessionSummary.state = options.state;
          sessionSummary.status = options.status ?? 'waiting';
          return Promise.resolve(sessionSummary);
        });

      const result = await service.startExplodingCatsSession(
        'host-1',
        roomDoc.id,
      );

      expect(createSessionSpy).toHaveBeenCalledTimes(1);
      expect(capturedOptions).toBeDefined();
      expect(capturedOptions).toMatchObject({
        roomId: roomDoc.id,
        gameId: 'exploding-kittens',
        engine: 'exploding_cats_v1',
        status: 'active',
      });

      const statePayload = capturedOptions?.state as {
        snapshot?: {
          playerOrder?: unknown;
          players?: unknown;
        };
      };

      expect(Array.isArray(statePayload.snapshot?.playerOrder)).toBe(true);
      expect(statePayload.snapshot?.playerOrder).toEqual(['host-1', 'guest-2']);

      expect(Array.isArray(statePayload.snapshot?.players)).toBe(true);
      const players = statePayload.snapshot?.players as Array<{
        playerId?: string;
      }>;
      expect(players).toHaveLength(2);
      expect(players.map((player) => player.playerId)).toEqual([
        'host-1',
        'guest-2',
      ]);

      expect(roomDoc.save).toHaveBeenCalledTimes(1);
      expect(realtime.emitRoomUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ id: roomDoc.id }),
      );
      expect(realtime.emitSessionSnapshot).toHaveBeenCalledWith(
        roomDoc.id,
        sessionSummary,
      );
      expect(result.room.status).toBe('in_progress');
      expect(result.session).toEqual(sessionSummary);
    });

    it('throws when fewer than two players are available', async () => {
      const roomDoc = createRoomDocument({ playerIds: ['host-1'] });
      gameRoomModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(roomDoc),
      });

      const createSessionSpy = jest.spyOn(service, 'createSession');

      await expect(
        service.startExplodingCatsSession('host-1', roomDoc.id),
      ).rejects.toThrow(BadRequestException);

      expect(createSessionSpy).not.toHaveBeenCalled();
    });

    it('prevents non-hosts from starting the match', async () => {
      const roomDoc = createRoomDocument();
      gameRoomModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(roomDoc),
      });

      await expect(
        service.startExplodingCatsSession('guest-2', roomDoc.id),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});

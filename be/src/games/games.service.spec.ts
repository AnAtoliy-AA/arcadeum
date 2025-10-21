import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { GamesService, type GameSessionSummary } from './games.service';
import { GameRoom } from './schemas/game-room.schema';
import { GameSession } from './schemas/game-session.schema';
import { GamesRealtimeService } from './games.realtime.service';
import type {
  ExplodingCatsCard,
  ExplodingCatsState,
} from './exploding-cats/exploding-cats.state';

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

type MockExplodingCatsSessionState = {
  snapshot: ExplodingCatsState;
  [key: string]: unknown;
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

  describe('drawExplodingCatsCard', () => {
    const createSnapshot = (options?: {
      deck?: ExplodingCatsCard[];
      hostHand?: ExplodingCatsCard[];
      guestHand?: ExplodingCatsCard[];
      pendingDraws?: number;
    }): ExplodingCatsState => ({
      deck: options?.deck ?? ['attack'],
      discardPile: [],
      playerOrder: ['host-1', 'guest-2'],
      currentTurnIndex: 0,
      pendingDraws: options?.pendingDraws ?? 1,
      players: [
        {
          playerId: 'host-1',
          hand: options?.hostHand ? [...options.hostHand] : ['defuse'],
          alive: true,
        },
        {
          playerId: 'guest-2',
          hand: options?.guestHand ? [...options.guestHand] : ['defuse'],
          alive: true,
        },
      ],
      logs: [],
    });

    const createSessionDocument = (snapshot: ExplodingCatsState) => ({
      roomId: 'room-123',
      engine: 'exploding_cats_v1',
      status: 'active',
      state: {
        engine: 'exploding-cats',
        version: 1,
        snapshot,
        lastUpdatedAt: new Date('2025-01-01T00:00:00.000Z').toISOString(),
      },
    });

    it('draws a card, updates the snapshot, and advances the turn', async () => {
      const roomDoc = createRoomDocument({ status: 'in_progress' });
      const snapshot = createSnapshot({ deck: ['attack'] });
      const sessionDoc = createSessionDocument(snapshot);

      gameRoomModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(roomDoc),
      });

      gameSessionModel.findOne = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(sessionDoc) });

      let updatedState: MockExplodingCatsSessionState | undefined;
      let updatedStatus: string | undefined;
      gameSessionModel.findOneAndUpdate = jest
        .fn()
        .mockImplementation(
          (
            _filter: unknown,
            update: { state: MockExplodingCatsSessionState; status?: string },
          ) => {
            updatedState = update.state;
            updatedStatus = update.status;
            return {
              exec: jest.fn().mockResolvedValue({
                ...sessionDoc,
                status: update.status ?? sessionDoc.status,
                state: update.state,
              }),
            };
          },
        );

      const summary = await service.drawExplodingCatsCard('host-1', roomDoc.id);

      expect(gameSessionModel.findOne).toHaveBeenCalled();
      expect(gameSessionModel.findOneAndUpdate).toHaveBeenCalled();
      expect(updatedStatus).toBeUndefined();
      expect(updatedState).toBeDefined();
      const state = updatedState as MockExplodingCatsSessionState;
      expect(state.snapshot.players[0].hand).toEqual(
        expect.arrayContaining(['defuse', 'attack']),
      );
      expect(state.snapshot.deck).toHaveLength(0);
      expect(state.snapshot.currentTurnIndex).toBe(1);
      expect(state.snapshot.pendingDraws).toBe(1);
      expect(state.snapshot.logs.length).toBeGreaterThan(0);
      expect(summary.status).toBe('active');
      expect(realtime.emitSessionSnapshot).toHaveBeenCalledWith(
        roomDoc.id,
        expect.objectContaining({ state }),
      );
    });

    it('defuses an exploding cat when the player has a defuse card', async () => {
      const roomDoc = createRoomDocument({ status: 'in_progress' });
      const snapshot = createSnapshot({
        deck: ['exploding_cat'],
        hostHand: ['defuse', 'attack'],
      });
      const sessionDoc = createSessionDocument(snapshot);

      gameRoomModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(roomDoc),
      });

      gameSessionModel.findOne = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(sessionDoc) });

      let updatedState: MockExplodingCatsSessionState | undefined;
      let updatedStatus: string | undefined;
      gameSessionModel.findOneAndUpdate = jest
        .fn()
        .mockImplementation(
          (
            _filter: unknown,
            update: { state: MockExplodingCatsSessionState; status?: string },
          ) => {
            updatedState = update.state;
            updatedStatus = update.status;
            return {
              exec: jest.fn().mockResolvedValue({
                ...sessionDoc,
                status: update.status ?? sessionDoc.status,
                state: update.state,
              }),
            };
          },
        );

      await service.drawExplodingCatsCard('host-1', roomDoc.id);

      const state = updatedState as MockExplodingCatsSessionState;
      const hostState = state.snapshot.players.find(
        (player: { playerId: string }) => player.playerId === 'host-1',
      );

      expect(hostState).toBeDefined();
      expect(hostState?.hand).toEqual(['attack']);
      expect(updatedStatus).toBeUndefined();
      expect(state.snapshot.playerOrder).toEqual(['host-1', 'guest-2']);
      expect(state.snapshot.deck).toContain('exploding_cat');
      expect(
        state.snapshot.logs.some((log: { message: string }) =>
          log.message.includes('used a Defuse'),
        ),
      ).toBe(true);
    });

    it('eliminates the player and completes the session when no defuse is available', async () => {
      const roomDoc = createRoomDocument({ status: 'in_progress' });
      const snapshot = createSnapshot({
        deck: ['exploding_cat'],
        hostHand: [],
      });
      const sessionDoc = createSessionDocument(snapshot);

      gameRoomModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(roomDoc),
      });

      gameSessionModel.findOne = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(sessionDoc) });

      let updatedState: MockExplodingCatsSessionState | undefined;
      let updatedStatus: string | undefined;
      gameSessionModel.findOneAndUpdate = jest
        .fn()
        .mockImplementation(
          (
            _filter: unknown,
            update: { state: MockExplodingCatsSessionState; status?: string },
          ) => {
            updatedState = update.state;
            updatedStatus = update.status;
            return {
              exec: jest.fn().mockResolvedValue({
                ...sessionDoc,
                status: update.status ?? sessionDoc.status,
                state: update.state,
              }),
            };
          },
        );

      await service.drawExplodingCatsCard('host-1', roomDoc.id);

      const state = updatedState as MockExplodingCatsSessionState;
      const hostState = state.snapshot.players.find(
        (player: { playerId: string }) => player.playerId === 'host-1',
      );

      expect(hostState).toBeDefined();
      expect(hostState?.alive).toBe(false);
      expect(state.snapshot.playerOrder).toEqual(['guest-2']);
      expect(updatedStatus).toBe('completed');
      expect(roomDoc.save).toHaveBeenCalledTimes(1);
      expect(roomDoc.status).toBe('completed');
      expect(realtime.emitRoomUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ id: roomDoc.id, status: 'completed' }),
      );
    });
  });

  describe('playExplodingCatsAction', () => {
    const createSnapshot = (options?: {
      deck?: ExplodingCatsCard[];
      hostHand?: ExplodingCatsCard[];
      guestHand?: ExplodingCatsCard[];
      pendingDraws?: number;
      currentTurnIndex?: number;
    }): ExplodingCatsState => ({
      deck: options?.deck ?? ['attack'],
      discardPile: [],
      playerOrder: ['host-1', 'guest-2'],
      currentTurnIndex: options?.currentTurnIndex ?? 0,
      pendingDraws: options?.pendingDraws ?? 1,
      players: [
        {
          playerId: 'host-1',
          hand: options?.hostHand ? [...options.hostHand] : ['defuse'],
          alive: true,
        },
        {
          playerId: 'guest-2',
          hand: options?.guestHand ? [...options.guestHand] : ['defuse'],
          alive: true,
        },
      ],
      logs: [],
    });

    const createSessionDocument = (snapshot: ExplodingCatsState) => ({
      roomId: 'room-123',
      engine: 'exploding_cats_v1',
      status: 'active',
      state: {
        engine: 'exploding-cats',
        version: 1,
        snapshot,
        lastUpdatedAt: new Date('2025-01-01T00:00:00.000Z').toISOString(),
      },
    });

    it('plays skip to end the turn when pending draws are satisfied', async () => {
      const roomDoc = createRoomDocument({ status: 'in_progress' });
      const snapshot = createSnapshot({ hostHand: ['skip', 'defuse'] });
      const sessionDoc = createSessionDocument(snapshot);

      gameRoomModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(roomDoc),
      });

      gameSessionModel.findOne = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(sessionDoc) });

      let updatedState: MockExplodingCatsSessionState | undefined;
      gameSessionModel.findOneAndUpdate = jest
        .fn()
        .mockImplementation(
          (
            _filter: unknown,
            update: { state: MockExplodingCatsSessionState; status?: string },
          ) => {
            updatedState = update.state;
            return {
              exec: jest.fn().mockResolvedValue({
                ...sessionDoc,
                status: update.status ?? sessionDoc.status,
                state: update.state,
              }),
            };
          },
        );

      await service.playExplodingCatsAction('host-1', roomDoc.id, 'skip');

      const state = updatedState as MockExplodingCatsSessionState;
      const hostHand = state.snapshot.players.find(
        (player: { playerId: string }) => player.playerId === 'host-1',
      )?.hand;

      expect(hostHand).toEqual(['defuse']);
      expect(state.snapshot.currentTurnIndex).toBe(1);
      expect(state.snapshot.pendingDraws).toBe(1);
      expect(state.snapshot.discardPile).toContain('skip');
      expect(
        state.snapshot.logs.some((log: { message: string }) =>
          log.message.includes('played a Skip'),
        ),
      ).toBe(true);
      expect(realtime.emitSessionSnapshot).toHaveBeenCalled();
    });

    it('reduces pending draws when skip is played under attack stack', async () => {
      const roomDoc = createRoomDocument({ status: 'in_progress' });
      const snapshot = createSnapshot({
        hostHand: ['skip'],
        pendingDraws: 3,
      });
      const sessionDoc = createSessionDocument(snapshot);

      gameRoomModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(roomDoc),
      });

      gameSessionModel.findOne = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(sessionDoc) });

      let updatedState: MockExplodingCatsSessionState | undefined;
      gameSessionModel.findOneAndUpdate = jest
        .fn()
        .mockImplementation(
          (
            _filter: unknown,
            update: { state: MockExplodingCatsSessionState; status?: string },
          ) => {
            updatedState = update.state;
            return {
              exec: jest.fn().mockResolvedValue({
                ...sessionDoc,
                status: update.status ?? sessionDoc.status,
                state: update.state,
              }),
            };
          },
        );

      await service.playExplodingCatsAction('host-1', roomDoc.id, 'skip');

      const state = updatedState as MockExplodingCatsSessionState;
      expect(state.snapshot.pendingDraws).toBe(2);
      expect(state.snapshot.currentTurnIndex).toBe(0);
    });

    it('plays attack to pass turn with increased draws to next player', async () => {
      const roomDoc = createRoomDocument({ status: 'in_progress' });
      const snapshot = createSnapshot({ hostHand: ['attack', 'defuse'] });
      const sessionDoc = createSessionDocument(snapshot);

      gameRoomModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(roomDoc),
      });

      gameSessionModel.findOne = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(sessionDoc) });

      let updatedState: MockExplodingCatsSessionState | undefined;
      gameSessionModel.findOneAndUpdate = jest
        .fn()
        .mockImplementation(
          (
            _filter: unknown,
            update: { state: MockExplodingCatsSessionState; status?: string },
          ) => {
            updatedState = update.state;
            return {
              exec: jest.fn().mockResolvedValue({
                ...sessionDoc,
                status: update.status ?? sessionDoc.status,
                state: update.state,
              }),
            };
          },
        );

      await service.playExplodingCatsAction('host-1', roomDoc.id, 'attack');

      const state = updatedState as MockExplodingCatsSessionState;
      const guestState = state.snapshot.players.find(
        (player: { playerId: string }) => player.playerId === 'guest-2',
      );

      expect(state.snapshot.currentTurnIndex).toBe(1);
      expect(state.snapshot.pendingDraws).toBe(2);
      expect(state.snapshot.discardPile).toContain('attack');
      expect(guestState?.alive).toBe(true);
    });
  });
});

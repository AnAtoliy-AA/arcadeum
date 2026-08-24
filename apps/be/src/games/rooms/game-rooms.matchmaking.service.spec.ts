import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GameRoomsMatchmakingService } from './game-rooms.matchmaking.service';
import { GameRoomsService } from './game-rooms.service';
import { GameRoomsQuickplayService } from './game-rooms.quickplay.service';
import { GamesRealtimeService } from '../games.realtime.service';
import { GameRoomSummary } from './game-rooms.types';

const flushMicrotasks = async (): Promise<void> => {
  await Promise.resolve();
  await Promise.resolve();
};

describe('GameRoomsMatchmakingService', () => {
  let service: GameRoomsMatchmakingService;
  let roomsService: jest.Mocked<GameRoomsService>;
  let quickplayService: jest.Mocked<GameRoomsQuickplayService>;
  let realtimeService: jest.Mocked<GamesRealtimeService>;

  const roomSummary: GameRoomSummary = {
    id: 'room-1',
    gameId: 'sea_battle_v1',
    name: 'Open Match',
    visibility: 'public',
    hostId: 'user1',
    status: 'lobby',
    maxPlayers: 2,
    participants: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as GameRoomSummary;

  beforeEach(async () => {
    jest.useFakeTimers();

    roomsService = {
      createRoom: jest.fn().mockResolvedValue(roomSummary),
      joinRoom: jest.fn().mockResolvedValue({ room: roomSummary, added: true }),
    } as unknown as jest.Mocked<GameRoomsService>;

    quickplayService = {
      createQuickplayRoom: jest.fn().mockResolvedValue(roomSummary),
    } as unknown as jest.Mocked<GameRoomsQuickplayService>;

    realtimeService = {
      emitRoomCreated: jest.fn(),
      emitPlayerJoined: jest.fn(),
      emitToUser: jest.fn(),
      emitMatchmakingSuccess: jest.fn(),
    } as unknown as jest.Mocked<GamesRealtimeService>;

    const config = {
      get: jest.fn().mockReturnValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameRoomsMatchmakingService,
        { provide: GameRoomsService, useValue: roomsService },
        { provide: GameRoomsQuickplayService, useValue: quickplayService },
        { provide: GamesRealtimeService, useValue: realtimeService },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = module.get(GameRoomsMatchmakingService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('joinQueue', () => {
    it('adds a user to the queue and emits status when no match exists', () => {
      service.joinQueue('user1', 'socket1', 'sea_battle_v1');

      expect(roomsService.createRoom).not.toHaveBeenCalled();
      expect(realtimeService.emitToUser).toHaveBeenCalledWith(
        'user1',
        'games.matchmaking.status',
        expect.objectContaining({
          gameId: 'sea_battle_v1',
          queueSize: 1,
          position: 1,
        }),
      );
    });

    it('pairs two users in the same game immediately', async () => {
      service.joinQueue('user1', 'socket1', 'sea_battle_v1');
      service.joinQueue('user2', 'socket2', 'sea_battle_v1');

      await flushMicrotasks();

      // The second joiner finds the first and becomes the room host.
      expect(roomsService.createRoom).toHaveBeenCalledWith(
        'user2',
        expect.objectContaining({ gameId: 'sea_battle_v1' }),
      );
      expect(roomsService.joinRoom).toHaveBeenCalledWith(
        { roomId: 'room-1' },
        'user1',
      );
      expect(realtimeService.emitMatchmakingSuccess).toHaveBeenCalledWith(
        'user1',
        'room-1',
      );
      expect(realtimeService.emitMatchmakingSuccess).toHaveBeenCalledWith(
        'user2',
        'room-1',
      );
    });

    it('does not pair users across different variants', () => {
      service.joinQueue('user1', 'socket1', 'sea_battle_v1', 'classic');
      service.joinQueue('user2', 'socket2', 'sea_battle_v1', 'blitz');

      expect(roomsService.createRoom).not.toHaveBeenCalled();
      expect(roomsService.joinRoom).not.toHaveBeenCalled();
    });

    it('replaces an existing queue entry when the same user re-joins', () => {
      service.joinQueue('user1', 'socket1', 'sea_battle_v1');
      service.joinQueue('user1', 'socket2', 'sea_battle_v1');

      expect(realtimeService.emitToUser).toHaveBeenLastCalledWith(
        'user1',
        'games.matchmaking.status',
        expect.objectContaining({ queueSize: 1, position: 1 }),
      );
    });
  });

  describe('leaveQueue', () => {
    it('removes a user from the queue so a later timeout does not fire', async () => {
      service.joinQueue('user1', 'socket1', 'sea_battle_v1');
      service.leaveQueue('user1');

      await jest.advanceTimersByTimeAsync(30_000);

      expect(quickplayService.createQuickplayRoom).not.toHaveBeenCalled();
      expect(realtimeService.emitMatchmakingSuccess).not.toHaveBeenCalled();
    });

    it('is a no-op for users not in the queue', () => {
      service.leaveQueue('ghost');

      expect(realtimeService.emitToUser).not.toHaveBeenCalled();
    });
  });

  describe('timeout handling', () => {
    it('falls back to a bot room when no opponent is queued', async () => {
      service.joinQueue('user1', 'socket1', 'sea_battle_v1');

      await jest.advanceTimersByTimeAsync(30_000);

      expect(quickplayService.createQuickplayRoom).toHaveBeenCalledWith(
        'user1',
        'sea_battle_v1',
        undefined,
      );
      expect(realtimeService.emitMatchmakingSuccess).toHaveBeenCalledWith(
        'user1',
        'room-1',
      );
    });

    it('does not create a bot room when the user left before the timeout', async () => {
      service.joinQueue('user1', 'socket1', 'sea_battle_v1');
      service.leaveQueue('user1');

      await jest.advanceTimersByTimeAsync(30_000);

      expect(quickplayService.createQuickplayRoom).not.toHaveBeenCalled();
    });
  });

  describe('configurable timeout', () => {
    it('uses the MATCHMAKING_TIMEOUT_MS env value when set', async () => {
      const config = {
        get: jest.fn().mockReturnValue('10000'),
      };

      const customModule: TestingModule = await Test.createTestingModule({
        providers: [
          GameRoomsMatchmakingService,
          { provide: GameRoomsService, useValue: roomsService },
          { provide: GameRoomsQuickplayService, useValue: quickplayService },
          { provide: GamesRealtimeService, useValue: realtimeService },
          { provide: ConfigService, useValue: config },
        ],
      }).compile();

      const customService = customModule.get(GameRoomsMatchmakingService);
      customService.joinQueue('user1', 'socket1', 'sea_battle_v1');

      await jest.advanceTimersByTimeAsync(9_999);
      expect(quickplayService.createQuickplayRoom).not.toHaveBeenCalled();

      await jest.advanceTimersByTimeAsync(1);
      expect(quickplayService.createQuickplayRoom).toHaveBeenCalledTimes(1);
    });
  });

  describe('status estimation', () => {
    it('reports a lone player position and the configured timeout as the wait', () => {
      service.joinQueue('user1', 'socket1', 'sea_battle_v1');

      const calls = (
        realtimeService.emitToUser as jest.MockedFunction<
          typeof realtimeService.emitToUser
        >
      ).mock.calls as Array<[string, string, unknown]>;
      const statusCall = calls.find(
        (call) => call[1] === 'games.matchmaking.status',
      );
      const emitted = statusCall?.[2] as {
        queueSize: number;
        position: number;
        estimatedWaitSeconds: number;
      };

      expect(emitted).toEqual(
        expect.objectContaining({
          queueSize: 1,
          position: 1,
          estimatedWaitSeconds: 30,
        }),
      );
    });

    it('prevents pairing users sharing the same IP in production', async () => {
      const prodConfig = {
        get: jest.fn((key: string) => {
          if (key === 'NODE_ENV') return 'production';
          return undefined;
        }),
      } as unknown as ConfigService;

      const prodModule = await Test.createTestingModule({
        providers: [
          GameRoomsMatchmakingService,
          { provide: GameRoomsService, useValue: roomsService },
          { provide: GameRoomsQuickplayService, useValue: quickplayService },
          { provide: GamesRealtimeService, useValue: realtimeService },
          { provide: ConfigService, useValue: prodConfig },
        ],
      }).compile();

      const prodService = prodModule.get(GameRoomsMatchmakingService);
      prodService.joinQueue(
        'user1',
        'socket1',
        'sea_battle_v1',
        undefined,
        false,
        undefined,
        '192.168.1.100',
      );
      prodService.joinQueue(
        'user2',
        'socket2',
        'sea_battle_v1',
        undefined,
        false,
        undefined,
        '192.168.1.100',
      );

      await flushMicrotasks();

      expect(roomsService.createRoom).not.toHaveBeenCalled();
      expect(roomsService.joinRoom).not.toHaveBeenCalled();
    });
  });
});

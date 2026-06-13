import { Test, TestingModule } from '@nestjs/testing';
import { GamesService } from './games.service';
import { GameRoomsService } from './rooms/game-rooms.service';
import { GameSessionsService } from './sessions/game-sessions.service';
import { GameHistoryService } from './history/game-history.service';
import { GamesRealtimeService } from './games.realtime.service';
import { GameUtilitiesService } from './utilities/game-utilities.service';
import { AuthService } from '../auth/auth.service';
import { GamesRematchService } from './games.rematch.service';
import { GameRoomsQuickplayService } from './rooms/game-rooms.quickplay.service';
import { SeaBattleService } from './sea-battle/sea-battle.service';
import { CriticalService } from './critical/critical.service';
import { GamesLeaderboardSyncService } from './games.leaderboard-sync.service';
import { GamePostMatchService } from './game-post-match.service';
import { CreateGameRoomDto } from './dtos/create-game-room.dto';
import { GameRoomSummary } from './rooms/game-rooms.types';
import { GameSessionSummary } from './sessions/game-sessions.service';

describe('GamesService', () => {
  let service: GamesService;
  let roomsService: jest.Mocked<GameRoomsService>;
  let roomsQuickplayService: jest.Mocked<GameRoomsQuickplayService>;
  let sessionsService: jest.Mocked<GameSessionsService>;
  let realtimeService: jest.Mocked<GamesRealtimeService>;
  let module: TestingModule;

  beforeEach(async () => {
    const mockRoomsService = {
      createRoom: jest.fn(),
      listRooms: jest.fn(),
      getRoom: jest.fn(),
      joinRoom: jest.fn(),
      leaveRoom: jest.fn(),
      deleteRoom: jest.fn(),
      getRoomParticipants: jest.fn(),
      updateRoomStatus: jest.fn(),
      ensureParticipant: jest.fn(),
    };

    const mockRoomsQuickplayService = {
      createQuickplayRoom: jest.fn(),
      findHumanMatch: jest.fn(),
    };

    const mockSessionsService = {
      createSession: jest.fn(),
      findSessionByRoom: jest.fn(),
      executeAction: jest.fn(),
      getSanitizedStateForPlayer: jest.fn(),
      getAvailableActions: jest.fn(),
      removePlayer: jest.fn(),
      getWinners: jest.fn(),
    };

    const mockHistoryService = {
      createHistoryRecord: jest.fn(),
      listHistoryByPlayer: jest.fn(),
    };

    const mockRealtimeService = {
      emitRoomCreated: jest.fn(),
      emitPlayerJoined: jest.fn(),
      emitPlayerLeft: jest.fn(),
      emitRoomDeleted: jest.fn(),
      emitGameStarted: jest.fn(),
      emitActionExecuted: jest.fn(),
    };

    const mockUtilities = {
      generateInviteCode: jest.fn(),
    };

    const mockAuthService = {
      validateToken: jest.fn(),
    };

    const mockRematchService = {
      createRematch: jest.fn(),
    };

    const mockSeaBattleService = {};
    const mockCriticalService = {};
    const mockLeaderboardSync = {
      syncInMatch: jest.fn().mockResolvedValue(undefined),
    };
    const mockPostMatchService = {
      onGameCompleted: jest.fn().mockResolvedValue(undefined),
      payoutGameWin: jest.fn().mockResolvedValue(undefined),
    };

    module = await Test.createTestingModule({
      providers: [
        GamesService,
        { provide: GameRoomsService, useValue: mockRoomsService },
        { provide: GameSessionsService, useValue: mockSessionsService },
        { provide: GameHistoryService, useValue: mockHistoryService },
        { provide: GamesRealtimeService, useValue: mockRealtimeService },
        { provide: GameUtilitiesService, useValue: mockUtilities },
        { provide: AuthService, useValue: mockAuthService },
        { provide: GamesRematchService, useValue: mockRematchService },
        {
          provide: GameRoomsQuickplayService,
          useValue: mockRoomsQuickplayService,
        },
        { provide: SeaBattleService, useValue: mockSeaBattleService },
        { provide: CriticalService, useValue: mockCriticalService },
        {
          provide: GamesLeaderboardSyncService,
          useValue: mockLeaderboardSync,
        },
        { provide: GamePostMatchService, useValue: mockPostMatchService },
      ],
    }).compile();

    service = module.get<GamesService>(GamesService);
    roomsService = module.get(GameRoomsService);
    roomsQuickplayService = module.get(GameRoomsQuickplayService);
    sessionsService = module.get(GameSessionsService);
    realtimeService = module.get(GamesRealtimeService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRoom', () => {
    it('should delegate to roomsService and emit event', async () => {
      const userId = 'user1';
      const dto: CreateGameRoomDto = {
        gameId: 'game1',
        name: 'My Room',
        visibility: 'public',
      };
      const createdRoom = { id: 'room1', ...dto };

      roomsService.createRoom.mockResolvedValue(
        createdRoom as unknown as GameRoomSummary,
      );
      realtimeService.emitRoomCreated.mockImplementation(() => {});

      const result = await service.createRoom(userId, dto);

      expect(roomsService.createRoom).toHaveBeenCalledWith(userId, dto);
      expect(realtimeService.emitRoomCreated).toHaveBeenCalledWith(createdRoom);
      expect(result).toEqual(createdRoom);
    });
  });

  describe('quickplay', () => {
    it('delegates to the quickplay service for sea_battle_v1', async () => {
      const room = { id: 'room1', gameId: 'sea_battle_v1' };
      roomsQuickplayService.createQuickplayRoom.mockResolvedValue(
        room as unknown as GameRoomSummary,
      );

      const result = await service.quickplay('user1', 'sea_battle_v1');

      expect(roomsQuickplayService.createQuickplayRoom).toHaveBeenCalledWith(
        'user1',
        'sea_battle_v1',
        undefined,
      );
      expect(result).toEqual(room);
    });

    it('rejects unsupported game ids', async () => {
      await expect(service.quickplay('user1', 'critical_v1')).rejects.toThrow(
        /Quickplay not supported/,
      );
      expect(roomsQuickplayService.createQuickplayRoom).not.toHaveBeenCalled();
    });
  });

  describe('findHumanMatch', () => {
    it('delegates to the quickplay service for sea_battle_v1', async () => {
      const room = { id: 'room2', gameId: 'sea_battle_v1' };
      roomsQuickplayService.findHumanMatch.mockResolvedValue(
        room as unknown as GameRoomSummary,
      );

      const result = await service.findHumanMatch('user1', 'sea_battle_v1');

      expect(roomsQuickplayService.findHumanMatch).toHaveBeenCalledWith(
        'user1',
        'sea_battle_v1',
        undefined,
      );
      expect(result).toEqual(room);
    });

    it('rejects unsupported game ids', async () => {
      await expect(
        service.findHumanMatch('user1', 'critical_v1'),
      ).rejects.toThrow(/Matchmaking not supported/);
      expect(roomsQuickplayService.findHumanMatch).not.toHaveBeenCalled();
    });
  });

  describe('startGameSession', () => {
    it('should start a session if user is host', async () => {
      const userId = 'user1';
      const roomId = 'room1';
      const dto = { roomId, engine: 'engine1' };
      const room = { id: roomId, hostId: userId, gameId: 'game1' };
      const playerIds = ['user1', 'user2'];
      const session = { id: 'session1', roomId };

      roomsService.getRoom.mockResolvedValue(
        room as unknown as GameRoomSummary,
      );
      roomsService.getRoomParticipants.mockResolvedValue(playerIds);
      sessionsService.createSession.mockResolvedValue(
        session as unknown as GameSessionSummary,
      );

      const result = await service.startGameSession(dto, userId);

      expect(roomsService.getRoom).toHaveBeenCalledWith(roomId, userId);
      expect(roomsService.getRoomParticipants).toHaveBeenCalledWith(roomId);
      expect(sessionsService.createSession).toHaveBeenCalledWith({
        roomId,
        gameId: room.gameId,
        playerIds,
        config: { engine: dto.engine },
      });
      expect(roomsService.updateRoomStatus).toHaveBeenCalledWith(
        roomId,
        'in_progress',
      );
      expect(realtimeService.emitGameStarted).toHaveBeenCalledWith(
        room,
        session,
        expect.any(Function),
      );
      expect(result).toEqual({ room, session });
    });

    it('should throw if user is not host', async () => {
      const userId = 'user2';
      const roomId = 'room1';
      const dto = { roomId };
      const room = { id: roomId, hostId: 'user1' };

      roomsService.getRoom.mockResolvedValue(
        room as unknown as GameRoomSummary,
      );

      await expect(service.startGameSession(dto, userId)).rejects.toThrow(
        'Only the host can start the game',
      );
    });
  });
});

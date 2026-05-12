import { Test, TestingModule } from '@nestjs/testing';
import { GamesService } from './games.service';
import { GameRoomsService } from './rooms/game-rooms.service';
import { GameSessionsService } from './sessions/game-sessions.service';
import { GameHistoryService } from './history/game-history.service';
import { GamesRealtimeService } from './games.realtime.service';
import { GameUtilitiesService } from './utilities/game-utilities.service';
import { AuthService } from '../auth/auth.service';
import { GamesRematchService } from './games.rematch.service';
import { SeaBattleService } from './sea-battle/sea-battle.service';
import { CriticalService } from './critical/critical.service';
import { GamesLeaderboardSyncService } from './games.leaderboard-sync.service';
import { WalletService } from '../wallet/wallet.service';
import { EconomySettingsService } from '../economy/economy-settings.service';
import { CreateGameRoomDto } from './dtos/create-game-room.dto';
import { GameRoomSummary } from './rooms/game-rooms.types';
import { GameSessionSummary } from './sessions/game-sessions.service';

describe('GamesService', () => {
  let service: GamesService;
  let roomsService: jest.Mocked<GameRoomsService>;
  let sessionsService: jest.Mocked<GameSessionsService>;
  let realtimeService: jest.Mocked<GamesRealtimeService>;
  let walletService: jest.Mocked<WalletService>;
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
    const mockWalletService = {
      credit: jest.fn(),
    };
    const mockEconomyService = {
      getNumber: jest.fn().mockResolvedValue(50),
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
        { provide: SeaBattleService, useValue: mockSeaBattleService },
        { provide: CriticalService, useValue: mockCriticalService },
        {
          provide: GamesLeaderboardSyncService,
          useValue: mockLeaderboardSync,
        },
        { provide: WalletService, useValue: mockWalletService },
        { provide: EconomySettingsService, useValue: mockEconomyService },
      ],
    }).compile();

    service = module.get<GamesService>(GamesService);
    roomsService = module.get(GameRoomsService);
    sessionsService = module.get(GameSessionsService);
    realtimeService = module.get(GamesRealtimeService);
    walletService = module.get(WalletService);
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

  describe('payoutGameWin', () => {
    const makeSession = (id: string): GameSessionSummary =>
      ({
        id,
        roomId: 'room1',
        gameId: 'critical_v1',
        status: 'completed',
      }) as GameSessionSummary;

    it('credits each winner with GAME_WIN_COIN_REWARD on session completion', async () => {
      const session = makeSession('sess-1');
      sessionsService.getWinners.mockResolvedValue(['winner-1', 'winner-2']);
      walletService.credit.mockResolvedValue({} as never);

      await service.payoutGameWin(session);

      expect(walletService.credit).toHaveBeenCalledTimes(2);
      expect(walletService.credit).toHaveBeenCalledWith(
        'winner-1',
        'coins',
        50,
        'game_win',
        'game-sess-1-payout-winner-1',
        { sessionId: 'sess-1', gameId: 'critical_v1' },
      );
      expect(walletService.credit).toHaveBeenCalledWith(
        'winner-2',
        'coins',
        50,
        'game_win',
        'game-sess-1-payout-winner-2',
        { sessionId: 'sess-1', gameId: 'critical_v1' },
      );
    });

    it('does nothing when winners list is empty (draw)', async () => {
      const session = makeSession('sess-2');
      sessionsService.getWinners.mockResolvedValue([]);

      await service.payoutGameWin(session);

      expect(walletService.credit).not.toHaveBeenCalled();
    });

    it('logs and continues when wallet.credit fails for one winner', async () => {
      const session = makeSession('sess-3');
      sessionsService.getWinners.mockResolvedValue(['winner-1', 'winner-2']);
      walletService.credit
        .mockRejectedValueOnce(new Error('wallet-down'))
        .mockResolvedValueOnce({} as never);

      await expect(service.payoutGameWin(session)).resolves.not.toThrow();
      expect(walletService.credit).toHaveBeenCalledTimes(2);
    });

    it('logs and skips all credits when getWinners throws', async () => {
      const session = makeSession('sess-4');
      sessionsService.getWinners.mockRejectedValue(new Error('engine-error'));

      await expect(service.payoutGameWin(session)).resolves.not.toThrow();
      expect(walletService.credit).not.toHaveBeenCalled();
    });
  });
});

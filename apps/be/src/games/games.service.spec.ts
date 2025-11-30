import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { GameRoomsService } from './rooms/game-rooms.service';
import { GameSessionsService } from './sessions/game-sessions.service';
import { GameHistoryService } from './history/game-history.service';
import { GamesRealtimeService } from './games.realtime.service';
import { ExplodingCatsActionsService } from './actions/exploding-cats/exploding-cats-actions.service';
import { TexasHoldemActionsService } from './actions/texas-holdem/texas-holdem-actions.service';
import { GameUtilitiesService } from './utilities/game-utilities.service';
import { CreateGameRoomDto } from './dtos/create-game-room.dto';

describe('GamesService', () => {
  let service: GamesService;
  let roomsService: jest.Mocked<GameRoomsService>;
  let sessionsService: jest.Mocked<GameSessionsService>;
  let historyService: jest.Mocked<GameHistoryService>;
  let realtimeService: jest.Mocked<GamesRealtimeService>;
  let explodingCatsActions: jest.Mocked<ExplodingCatsActionsService>;
  let texasHoldemActions: jest.Mocked<TexasHoldemActionsService>;
  let utilities: jest.Mocked<GameUtilitiesService>;

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
    };

    const mockHistoryService = {
      listHistoryForUser: jest.fn(),
      getHistoryEntry: jest.fn(),
      hideHistoryEntry: jest.fn(),
      createRematchFromHistory: jest.fn(),
      postHistoryNote: jest.fn(),
    };

    const mockRealtimeService = {
      emitRoomCreated: jest.fn(),
      emitPlayerJoined: jest.fn(),
      emitPlayerLeft: jest.fn(),
      emitRoomDeleted: jest.fn(),
      emitGameStarted: jest.fn(),
      emitActionExecuted: jest.fn(),
    };

    const mockExplodingCatsActions = {
      drawCard: jest.fn(),
      playActionCard: jest.fn(),
      playCatCombo: jest.fn(),
      playFavor: jest.fn(),
      seeFuture: jest.fn(),
      defuse: jest.fn(),
    };

    const mockTexasHoldemActions = {
      fold: jest.fn(),
      check: jest.fn(),
      call: jest.fn(),
      raise: jest.fn(),
      allIn: jest.fn(),
      bet: jest.fn(),
    };

    const mockUtilities = {
      fetchUserSummaries: jest.fn(),
      getUserDisplayName: jest.fn(),
      validateUserIds: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesService,
        { provide: GameRoomsService, useValue: mockRoomsService },
        { provide: GameSessionsService, useValue: mockSessionsService },
        { provide: GameHistoryService, useValue: mockHistoryService },
        { provide: GamesRealtimeService, useValue: mockRealtimeService },
        { provide: ExplodingCatsActionsService, useValue: mockExplodingCatsActions },
        { provide: TexasHoldemActionsService, useValue: mockTexasHoldemActions },
        { provide: GameUtilitiesService, useValue: mockUtilities },
      ],
    }).compile();

    service = module.get<GamesService>(GamesService);
    roomsService = module.get(GameRoomsService);
    sessionsService = module.get(GameSessionsService);
    historyService = module.get(GameHistoryService);
    realtimeService = module.get(GamesRealtimeService);
    explodingCatsActions = module.get(ExplodingCatsActionsService);
    texasHoldemActions = module.get(TexasHoldemActionsService);
    utilities = module.get(GameUtilitiesService);
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

      roomsService.createRoom.mockResolvedValue(createdRoom as any);

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

      roomsService.getRoom.mockResolvedValue(room as any);
      roomsService.getRoomParticipants.mockResolvedValue(playerIds);
      sessionsService.createSession.mockResolvedValue(session as any);

      const result = await service.startGameSession(dto, userId);

      expect(roomsService.getRoom).toHaveBeenCalledWith(roomId, userId);
      expect(roomsService.getRoomParticipants).toHaveBeenCalledWith(roomId);
      expect(sessionsService.createSession).toHaveBeenCalledWith({
        roomId,
        gameId: room.gameId,
        playerIds,
        config: { engine: dto.engine },
      });
      expect(roomsService.updateRoomStatus).toHaveBeenCalledWith(roomId, 'in_progress');
      expect(realtimeService.emitGameStarted).toHaveBeenCalledWith(room, session);
      expect(result).toEqual({ room, session });
    });

    it('should throw if user is not host', async () => {
      const userId = 'user2';
      const roomId = 'room1';
      const dto = { roomId };
      const room = { id: roomId, hostId: 'user1' };

      roomsService.getRoom.mockResolvedValue(room as any);

      await expect(service.startGameSession(dto, userId)).rejects.toThrow('Only the host can start the game');
    });
  });

  describe('drawExplodingCatsCard', () => {
    it('should delegate to explodingCatsActions', async () => {
      const sessionId = 'session1';
      const userId = 'user1';
      const result = { id: sessionId };

      explodingCatsActions.drawCard.mockResolvedValue(result as any);

      const response = await service.drawExplodingCatsCard(sessionId, userId);

      expect(explodingCatsActions.drawCard).toHaveBeenCalledWith(sessionId, userId);
      expect(response).toEqual(result);
    });
  });

  describe('playExplodingCatsAction', () => {
    it('should delegate to explodingCatsActions', async () => {
      const sessionId = 'session1';
      const userId = 'user1';
      const payload = { card: 'attack' };
      const result = { id: sessionId };

      explodingCatsActions.playActionCard.mockResolvedValue(result as any);

      const response = await service.playExplodingCatsAction(sessionId, userId, payload);

      expect(explodingCatsActions.playActionCard).toHaveBeenCalledWith(sessionId, userId, payload);
      expect(response).toEqual(result);
    });
  });
});


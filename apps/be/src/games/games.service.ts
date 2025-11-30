import { Injectable } from '@nestjs/common';
import { GameRoomsService } from './rooms/game-rooms.service';
import { GameSessionsService } from './sessions/game-sessions.service';
import { GameHistoryService } from './history/game-history.service';
import { GamesRealtimeService } from './games.realtime.service';
import { ExplodingCatsActionsService } from './actions/exploding-cats/exploding-cats-actions.service';
import { TexasHoldemActionsService } from './actions/texas-holdem/texas-holdem-actions.service';
import { GameUtilitiesService } from './utilities/game-utilities.service';
import { CreateGameRoomDto } from './dtos/create-game-room.dto';
import { JoinGameRoomDto } from './dtos/join-game-room.dto';
import { LeaveGameRoomDto } from './dtos/leave-game-room.dto';
import { DeleteGameRoomDto } from './dtos/delete-game-room.dto';
import { StartGameDto } from './dtos/start-game.dto';
import { HistoryRematchDto } from './dtos/history-rematch.dto';
import { StartGameSessionResult } from './games.types';

/**
 * Games Service Facade
 * Coordinates between specialized services and provides a unified API
 *
 * This is the main service that controllers and gateways should use.
 * It delegates to specialized services for specific operations.
 */
@Injectable()
export class GamesService {
  constructor(
    private readonly roomsService: GameRoomsService,
    private readonly sessionsService: GameSessionsService,
    private readonly historyService: GameHistoryService,
    private readonly realtimeService: GamesRealtimeService,
    private readonly explodingCatsActions: ExplodingCatsActionsService,
    private readonly texasHoldemActions: TexasHoldemActionsService,
    private readonly utilities: GameUtilitiesService,
  ) {}

  // ========== Room Operations ==========

  /**
   * Create a new game room
   */
  async createRoom(userId: string, dto: CreateGameRoomDto) {
    const room = await this.roomsService.createRoom(userId, dto);

    // Emit real-time event
    this.realtimeService.emitRoomCreated(room);

    return room;
  }

  /**
   * List game rooms
   */
  async listRooms(filters: any = {}, viewerId?: string) {
    return this.roomsService.listRooms(filters, viewerId);
  }

  /**
   * Get a specific room
   */
  async getRoom(roomId: string, userId?: string) {
    return this.roomsService.getRoom(roomId, userId);
  }

  /**
   * Get room with session
   */
  async getRoomSession(roomId: string, userId?: string) {
    const room = await this.roomsService.getRoom(roomId, userId);
    const session = await this.sessionsService.findSessionByRoom(roomId);

    return { room, session };
  }

  /**
   * Join a game room
   */
  async joinRoom(dto: JoinGameRoomDto, userId: string) {
    const room = await this.roomsService.joinRoom(dto, userId);
    const session = dto.roomId
      ? await this.sessionsService.findSessionByRoom(dto.roomId)
      : null;

    // Emit real-time event
    this.realtimeService.emitPlayerJoined(room, userId);

    return { room, session };
  }

  /**
   * Leave a game room
   */
  async leaveRoom(dto: LeaveGameRoomDto, userId: string) {
    const result = await this.roomsService.leaveRoom(dto, userId);

    // Remove player from session if exists
    if (!result.deleted) {
      const session = await this.sessionsService.findSessionByRoom(dto.roomId);
      if (session) {
        await this.sessionsService.removePlayer(session.id, userId);
      }
    }

    // Emit real-time event
    this.realtimeService.emitPlayerLeft(result.room, userId, result.deleted);

    return result;
  }

  /**
   * Delete a game room
   */
  async deleteRoom(dto: DeleteGameRoomDto, userId: string) {
    const result = await this.roomsService.deleteRoom(dto, userId);

    // Emit real-time event
    this.realtimeService.emitRoomDeleted(dto.roomId);

    return result;
  }

  // ========== Session Operations ==========

  /**
   * Start a game session
   */
  async startGameSession(
    dto: StartGameDto,
    userId: string,
  ): Promise<StartGameSessionResult> {
    const { roomId } = dto;

    // Get room
    const room = await this.roomsService.getRoom(roomId, userId);

    // Ensure user is the host
    if (room.hostId !== userId) {
      throw new Error('Only the host can start the game');
    }

    // Get player IDs
    const playerIds = await this.roomsService.getRoomParticipants(roomId);

    // Create session
    const session = await this.sessionsService.createSession({
      roomId,
      gameId: room.gameId,
      playerIds,
      config: { engine: dto.engine },
    });

    // Update room status
    await this.roomsService.updateRoomStatus(roomId, 'in_progress');

    // Emit real-time event
    this.realtimeService.emitGameStarted(room, session);

    return { room, session };
  }

  /**
   * Execute a player action
   */
  async executeAction(
    sessionId: string,
    action: string,
    userId: string,
    payload?: any,
  ) {
    const session = await this.sessionsService.executeAction({
      sessionId,
      action,
      userId,
      payload,
    });

    // Emit real-time event
    this.realtimeService.emitActionExecuted(session, action, userId);

    return session;
  }

  /**
   * Get sanitized session state for a player
   */
  async getSanitizedState(sessionId: string, playerId: string) {
    return this.sessionsService.getSanitizedStateForPlayer(sessionId, playerId);
  }

  /**
   * Get available actions for a player
   */
  async getAvailableActions(sessionId: string, playerId: string) {
    return this.sessionsService.getAvailableActions(sessionId, playerId);
  }

  // ========== History Operations ==========

  /**
   * List game history for a user
   */
  async listHistoryForUser(
    userId: string,
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      grouped?: boolean;
    },
  ) {
    // Get all history
    const allHistory = await this.historyService.listHistoryForUser(
      userId,
      options?.grouped || false,
    );

    // Apply filters
    const filtered: any[] = [...allHistory];

    // Search filter
    if (options?.search && !options.grouped) {
      const searchLower = options.search.toLowerCase();
      const gameHistory = filtered as any[];
      const searchFiltered = gameHistory.filter((entry) => {
        return (
          entry.gameName?.toLowerCase().includes(searchLower) ||
          entry.gameId?.toLowerCase().includes(searchLower)
        );
      });
      filtered.length = 0;
      filtered.push(...searchFiltered);
    }

    // Status filter
    if (options?.status && !options.grouped) {
      const gameHistory = filtered as any[];
      const statusFiltered = gameHistory.filter((entry) => entry.status === options.status);
      filtered.length = 0;
      filtered.push(...statusFiltered);
    }

    // Pagination
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const offset = (page - 1) * limit;
    const entries = filtered.slice(offset, offset + limit);

    return {
      entries,
      total: filtered.length,
      page,
      limit,
      hasMore: offset + entries.length < filtered.length,
    };
  }

  /**
   * Get a specific history entry
   */
  async getHistoryEntry(userId: string, roomId: string) {
    return this.historyService.getHistoryEntry(roomId, userId);
  }

  /**
   * Hide a history entry
   */
  async hideHistoryEntry(userId: string, roomId: string) {
    return this.historyService.hideHistoryEntry(userId, roomId);
  }

  /**
   * Create a rematch
   */
  async createRematchFromHistory(
    userId: string,
    roomId: string,
    participantIds: string[],
    options?: {
      gameId?: string;
      name?: string;
      visibility?: 'public' | 'private';
    },
  ) {
    const dto: HistoryRematchDto = {
      roomId,
      participantIds,
      ...options,
    };
    return this.historyService.createRematchFromHistory(dto, userId);
  }

  /**
   * Post a note to game history
   */
  async postHistoryNote(roomId: string, userId: string, message: string) {
    await this.historyService.postHistoryNote(roomId, userId, message);

    // Broadcast the updated session to all clients
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (session) {
      this.realtimeService.emitSessionSnapshot(roomId, session);
    }
  }

  // ========== Utility Operations ==========

  /**
   * Find session by room ID
   */
  async findSessionByRoom(roomId: string) {
    return this.sessionsService.findSessionByRoom(roomId);
  }

  /**
   * Ensure user is a participant in a room
   */
  async ensureParticipant(roomId: string, userId: string) {
    await this.roomsService.ensureParticipant(roomId, userId);
    return this.roomsService.getRoom(roomId, userId);
  }

  // ========== Exploding Cats Specific Actions ==========

  /**
   * Draw a card in Exploding Cats
   */
  async drawExplodingCatsCard(sessionId: string, userId: string) {
    return this.explodingCatsActions.drawCard(sessionId, userId);
  }

  /**
   * Play an Exploding Cats action card
   */
  async playExplodingCatsAction(
    sessionId: string,
    userId: string,
    payload: { card: string },
  ) {
    return this.explodingCatsActions.playActionCard(sessionId, userId, payload);
  }

  /**
   * Play a cat combo in Exploding Cats
   */
  async playExplodingCatsCatCombo(
    sessionId: string,
    userId: string,
    payload: {
      cards: string[];
      targetPlayerId: string;
      requestedCard?: string;
    },
  ) {
    return this.explodingCatsActions.playCatCombo(sessionId, userId, payload);
  }

  /**
   * Play a favor card in Exploding Cats
   */
  async playExplodingCatsFavor(
    sessionId: string,
    userId: string,
    payload: {
      targetPlayerId: string;
      requestedCard: string;
    },
  ) {
    return this.explodingCatsActions.playFavor(sessionId, userId, payload);
  }

  /**
   * See the future in Exploding Cats
   */
  async playExplodingCatsSeeTheFuture(sessionId: string, userId: string) {
    return this.explodingCatsActions.seeFuture(sessionId, userId);
  }

  /**
   * Defuse an exploding cat
   */
  async defuseExplodingCat(
    sessionId: string,
    userId: string,
    payload: { position: number },
  ) {
    return this.explodingCatsActions.defuse(sessionId, userId, payload);
  }

  // ========== Texas Hold'em Specific Actions ==========

  /**
   * Fold in Texas Hold'em
   */
  async texasHoldemFold(sessionId: string, userId: string) {
    return this.texasHoldemActions.fold(sessionId, userId);
  }

  /**
   * Check in Texas Hold'em
   */
  async texasHoldemCheck(sessionId: string, userId: string) {
    return this.texasHoldemActions.check(sessionId, userId);
  }

  /**
   * Call in Texas Hold'em
   */
  async texasHoldemCall(sessionId: string, userId: string) {
    return this.texasHoldemActions.call(sessionId, userId);
  }

  /**
   * Raise in Texas Hold'em
   */
  async texasHoldemRaise(
    sessionId: string,
    userId: string,
    payload: { amount: number },
  ) {
    return this.texasHoldemActions.raise(sessionId, userId, payload);
  }

  /**
   * Go all-in in Texas Hold'em
   */
  async texasHoldemAllIn(sessionId: string, userId: string) {
    return this.texasHoldemActions.allIn(sessionId, userId);
  }

  /**
   * Bet in Texas Hold'em
   */
  async texasHoldemBet(
    sessionId: string,
    userId: string,
    payload: { amount: number },
  ) {
    return this.texasHoldemActions.bet(sessionId, userId, payload);
  }

  // ========== Utility Methods ==========

  /**
   * Fetch user summaries
   */
  async fetchUserSummaries(userIds: string[]) {
    return this.utilities.fetchUserSummaries(userIds);
  }

  /**
   * Get user display name
   */
  async getUserDisplayName(userId: string) {
    return this.utilities.getUserDisplayName(userId);
  }

  /**
   * Validate user IDs
   */
  async validateUserIds(userIds: string[]) {
    return this.utilities.validateUserIds(userIds);
  }

  // ========== Backward Compatibility Methods ==========
  // These methods provide backward compatibility with the old API

  /**
   * Start an Exploding Cats session (backward compatibility)
   * @deprecated Use startGameSession instead
   */
  async startExplodingCatsSession(
    userId: string,
    roomId?: string,
    engine?: string,
  ): Promise<StartGameSessionResult> {
    // If roomId is not provided, try to find the user's current room
    let effectiveRoomId = roomId;
    if (!effectiveRoomId) {
      const userRooms = await this.roomsService.listRooms(
        {
          userId,
          participation: 'any',
          status: 'lobby',
        },
        userId,
      );

      if (userRooms.length === 0) {
        throw new Error(
          'User is not in any active room. Please provide roomId.',
        );
      }

      if (userRooms.length > 1) {
        throw new Error(
          'User is in multiple rooms. Please specify which roomId to start.',
        );
      }

      effectiveRoomId = userRooms[0].id;
    }

    return this.startGameSession({ roomId: effectiveRoomId, engine }, userId);
  }

  /**
   * Post a note to Exploding Cats history (backward compatibility)
   * @deprecated Use postHistoryNote instead
   */
  async postExplodingCatsHistoryNote(userId: string, roomId: string, message: string, scope?: string) {
    // scope parameter is ignored - keeping for backward compatibility
    return this.postHistoryNote(roomId, userId, message);
  }

  /**
   * Start Texas Hold'em session (backward compatibility)
   * @deprecated Use startGameSession instead
   */
  async startTexasHoldemSession(userId: string, roomId?: string, engine?: string, startingChips?: number) {
    // startingChips parameter is handled in the engine config
    return this.startExplodingCatsSession(userId, roomId, engine);
  }

  /**
   * Texas Hold'em player action (backward compatibility)
   * @deprecated Use specific action methods instead
   */
  async texasHoldemPlayerAction(userId: string, roomId: string, action: string, raiseAmount?: number) {
    const session = await this.findSessionByRoom(roomId);
    if (!session) {
      throw new Error('Session not found');
    }
    const payload = raiseAmount ? { amount: raiseAmount } : undefined;
    return this.executeAction(session.id, action, userId, payload);
  }

  /**
   * Post a note to Texas Hold'em history (backward compatibility)
   * @deprecated Use postHistoryNote instead
   */
  async postTexasHoldemHistoryNote(userId: string, roomId: string, message: string, scope?: string) {
    // scope parameter is ignored - keeping for backward compatibility
    return this.postHistoryNote(roomId, userId, message);
  }

  // ========== Gateway Compatibility Wrappers ==========
  // These methods accept roomId and convert to sessionId for gateway compatibility

  /**
   * Play Exploding Cats action card (gateway wrapper)
   */
  async playExplodingCatsActionByRoom(userId: string, roomId: string, card: string) {
    const session = await this.findSessionByRoom(roomId);
    if (!session) throw new Error('Session not found');
    return this.playExplodingCatsAction(session.id, userId, { card });
  }

  /**
   * Play cat combo (gateway wrapper)
   */
  async playExplodingCatsCatComboByRoom(
    userId: string,
    roomId: string,
    cat: string,
    payload: { mode: string; targetPlayerId: string; desiredCard?: string },
  ) {
    const session = await this.findSessionByRoom(roomId);
    if (!session) throw new Error('Session not found');

    // Convert to the format expected by the action service
    const cards = payload.mode === 'trio' ? [cat, cat, cat] : [cat, cat];
    return this.playExplodingCatsCatCombo(session.id, userId, {
      cards,
      targetPlayerId: payload.targetPlayerId,
      requestedCard: payload.desiredCard,
    });
  }

  /**
   * Play favor card (gateway wrapper)
   */
  async playExplodingCatsFavorByRoom(
    userId: string,
    roomId: string,
    targetPlayerId: string,
    requestedCard: string,
  ) {
    const session = await this.findSessionByRoom(roomId);
    if (!session) throw new Error('Session not found');
    return this.playExplodingCatsFavor(session.id, userId, {
      targetPlayerId,
      requestedCard,
    });
  }

  /**
   * See the future (gateway wrapper)
   */
  async playExplodingCatsSeeTheFutureByRoom(userId: string, roomId: string) {
    const session = await this.findSessionByRoom(roomId);
    if (!session) throw new Error('Session not found');
    const result = await this.playExplodingCatsSeeTheFuture(session.id, userId);

    // Extract topCards from the session state for backward compatibility
    const topCards = (result.state as any)?.deck?.slice(0, 3) || [];
    return { ...result, topCards };
  }
}

import { Injectable } from '@nestjs/common';
import { ChatScope } from './engines/base/game-engine.interface';
import { GameRoomsService } from './rooms/game-rooms.service';
import { GameSessionsService } from './sessions/game-sessions.service';
import { GameHistoryService } from './history/game-history.service';
import { GamesRealtimeService } from './games.realtime.service';
import { GameUtilitiesService } from './utilities/game-utilities.service';
import { AuthService } from '../auth/auth.service';
import { CreateGameRoomDto } from './dtos/create-game-room.dto';
import { JoinGameRoomDto } from './dtos/join-game-room.dto';
import { LeaveGameRoomDto } from './dtos/leave-game-room.dto';
import { DeleteGameRoomDto } from './dtos/delete-game-room.dto';
import { StartGameDto } from './dtos/start-game.dto';
import { StartGameSessionResult } from './games.types';
import { ListRoomsFilters } from './rooms/game-rooms.types';
import { GamesRematchService } from './games.rematch.service';

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
    private readonly utilities: GameUtilitiesService,
    private readonly authService: AuthService,
    private readonly rematchService: GamesRematchService,
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
  async listRooms(filters: ListRoomsFilters = {}, viewerId?: string) {
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
    let session = await this.sessionsService.findSessionByRoom(roomId);

    if (session && userId) {
      try {
        const sanitized = await this.sessionsService.getSanitizedStateForPlayer(
          session.id,
          userId,
        );
        if (sanitized && typeof sanitized === 'object') {
          session = { ...session, state: sanitized as Record<string, unknown> };
        }
      } catch {
        // If sanitization fails, return null session or handle appropriately
        // For now, we'll log logs if we had a logger, but safely continue
        // typically we might want to return a filtered "spectator" view if we could
      }
    }

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
        const updatedSession = await this.sessionsService.removePlayer(
          session.id,
          userId,
        );
        // Sync status if game completed via leave/forfeit
        if (updatedSession.status === 'completed') {
          await this.roomsService.updateRoomStatus(dto.roomId, 'completed');
        }
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
      config: { engine: dto.engine, ...room.gameOptions },
    });

    // Update room status
    await this.roomsService.updateRoomStatus(roomId, 'in_progress');

    // Emit real-time event
    await this.realtimeService.emitGameStarted(
      room,
      session,
      async (s, pId) => {
        const sanitized = await this.sessionsService.getSanitizedStateForPlayer(
          s.id,
          pId,
        );
        // Ensure we return a GameSessionSummary structure
        if (sanitized && typeof sanitized === 'object') {
          return { ...s, state: sanitized as Record<string, unknown> };
        }
        return s;
      },
    );

    return { room, session };
  }

  /**
   * Execute a player action
   */
  async executeAction(
    sessionId: string,
    action: string,
    userId: string,
    payload?: unknown,
  ) {
    const session = await this.sessionsService.executeAction({
      sessionId,
      action,
      userId,
      payload,
    });

    // Emit real-time event
    // Emit real-time event
    await this.realtimeService.emitActionExecuted(
      session,
      action,
      userId,
      async (s, pId) => {
        const sanitized = await this.sessionsService.getSanitizedStateForPlayer(
          s.id,
          pId,
        );
        if (sanitized && typeof sanitized === 'object') {
          return { ...s, state: sanitized as Record<string, unknown> };
        }
        return s;
      },
    );

    // Sync room status if game completed
    if (session.status === 'completed') {
      await this.roomsService.updateRoomStatus(session.roomId, 'completed');
    }

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

    // Use utility for filtering and pagination
    return this.utilities.filterAndPaginateHistory(allHistory, options);
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
      gameOptions?: Record<string, unknown>;
      message?: string;
    },
  ) {
    return this.rematchService.createRematchFromHistory(
      userId,
      roomId,
      participantIds,
      options,
    );
  }

  /**
   * Decline a rematch invitation
   */
  async declineInvitation(roomId: string, userId: string): Promise<void> {
    return this.rematchService.declineInvitation(roomId, userId);
  }

  /**
   * Block re-invites for a specific rematch room
   */
  async blockRematchRoom(roomId: string, userId: string): Promise<void> {
    return this.rematchService.blockRematchRoom(roomId, userId);
  }

  /**
   * Re-invite players to a rematch
   */
  async reinvitePlayers(
    roomId: string,
    hostId: string,
    userIds: string[],
  ): Promise<void> {
    return this.rematchService.reinvitePlayers(roomId, hostId, userIds);
  }

  /**
   * Post a note to game history
   */
  async postHistoryNote(
    roomId: string,
    userId: string,
    message: string,
    scope: ChatScope = 'all',
  ) {
    await this.historyService.postHistoryNote(roomId, userId, message, scope);

    // Broadcast the updated session to all clients
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (session) {
      await this.realtimeService.emitSessionSnapshot(
        roomId,
        session,
        async (s, pId) => {
          const sanitized =
            await this.sessionsService.getSanitizedStateForPlayer(s.id, pId);
          if (sanitized && typeof sanitized === 'object') {
            return { ...s, state: sanitized as Record<string, unknown> };
          }
          return s;
        },
      );
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
    const added = await this.roomsService.ensureParticipant(roomId, userId);
    const room = await this.roomsService.getRoom(roomId, userId);

    if (added) {
      // If user was added (not just rejoining), broadcast to room
      this.realtimeService.emitPlayerJoined(room, userId);
    }

    return room;
  }

  /**
   * Validate user IDs
   */
  async validateUserIds(userIds: string[]) {
    return this.utilities.validateUserIds(userIds);
  }

  /**
   * Update room options
   */
  async updateRoomOptions(
    roomId: string,
    userId: string,
    options: Record<string, unknown>,
  ) {
    const room = await this.roomsService.updateRoomOptions(
      roomId,
      userId,
      options,
    );
    this.realtimeService.emitRoomUpdated(room);
    return room;
  }

  /**
   * Reorder participants in a room
   */
  async reorderParticipants(
    roomId: string,
    userId: string,
    newOrder: string[],
  ) {
    const room = await this.roomsService.reorderParticipants(
      roomId,
      userId,
      newOrder,
    );

    // Emit real-time event
    this.realtimeService.emitRoomUpdate(room);

    return room;
  }
}

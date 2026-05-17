import {
  Injectable,
  Logger,
  Inject,
  forwardRef,
  BadRequestException,
} from '@nestjs/common';
import { ChatScope } from './engines/base/game-engine.interface';
import { GameRoomsService } from './rooms/game-rooms.service';
import {
  GameSessionsService,
  GameSessionSummary,
} from './sessions/game-sessions.service';
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
import { GameRoomsQuickplayService } from './rooms/game-rooms.quickplay.service';
import { SeaBattleService } from './sea-battle/sea-battle.service';
import { CriticalService } from './critical/critical.service';
import { GamesLeaderboardSyncService } from './games.leaderboard-sync.service';
import { WalletService } from '../wallet/wallet.service';
import { EconomySettingsService } from '../economy/economy-settings.service';

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);

  constructor(
    private readonly roomsService: GameRoomsService,
    private readonly sessionsService: GameSessionsService,
    private readonly historyService: GameHistoryService,
    private readonly realtimeService: GamesRealtimeService,
    private readonly utilities: GameUtilitiesService,
    private readonly authService: AuthService,
    private readonly rematchService: GamesRematchService,
    private readonly roomsQuickplayService: GameRoomsQuickplayService,
    @Inject(forwardRef(() => SeaBattleService))
    private readonly seaBattleService: SeaBattleService,
    @Inject(forwardRef(() => CriticalService))
    private readonly criticalService: CriticalService,
    private readonly leaderboardSync: GamesLeaderboardSyncService,
    private readonly wallet: WalletService,
    private readonly economy: EconomySettingsService,
  ) {}

  // ========== Room Operations ==========

  async createRoom(userId: string, dto: CreateGameRoomDto) {
    const room = await this.roomsService.createRoom(userId, dto);

    // Emit real-time event
    this.realtimeService.emitRoomCreated(room);

    return room;
  }

  async quickplay(userId: string, gameId: string) {
    if (gameId !== 'sea_battle_v1') {
      throw new BadRequestException(`Quickplay not supported for ${gameId}`);
    }
    return this.roomsQuickplayService.createQuickplayRoom(userId, gameId);
  }

  async findHumanMatch(userId: string, gameId: string) {
    if (gameId !== 'sea_battle_v1') {
      throw new BadRequestException(`Matchmaking not supported for ${gameId}`);
    }
    return this.roomsQuickplayService.findHumanMatch(userId, gameId);
  }

  async listRooms(filters: ListRoomsFilters = {}, viewerId?: string) {
    return this.roomsService.listRooms(filters, viewerId);
  }

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
        // If sanitization fails, return null session or handle appropriately;
        // safely continue with the unsanitized session state
      }
    }

    return { room, session };
  }

  /**
   * Join a game room
   */
  async joinRoom(dto: JoinGameRoomDto, userId: string) {
    const result = await this.roomsService.joinRoom(dto, userId);
    const room = result.room;

    // Broadcast join event if new player
    if (result.added) {
      this.realtimeService.emitPlayerJoined(room, userId);
    }

    const session = dto.roomId
      ? await this.sessionsService.findSessionByRoom(dto.roomId)
      : null;

    // Trigger bot if exists
    if (session) {
      if (room.gameId === 'sea_battle_v1') {
        await this.seaBattleService.findSessionByRoom(room.id);
      } else if (room.gameId === 'critical_v1') {
        await this.criticalService.findSessionByRoom(room.id);
      }
    }

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
          const remaining = await this.roomsService.getRoomParticipants(
            dto.roomId,
          );
          await this.leaderboardSync.syncInMatch(remaining, false);
        }
      }
    }
    await this.leaderboardSync.syncInMatch([userId], false);

    // Emit real-time event
    this.realtimeService.emitPlayerLeft(
      result.room,
      userId,
      result.deleted,
      result.kicked,
    );

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

    // Mark players as in-match for the leaderboard LIVE chip.
    await this.leaderboardSync.syncInMatch(playerIds, true);

    // Emit real-time event
    await this.realtimeService.emitGameStarted(
      room,
      session,
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
      const players = await this.roomsService.getRoomParticipants(
        session.roomId,
      );
      await this.leaderboardSync.syncInMatch(players, false);
      await this.payoutGameWin(session);
    }

    return session;
  }

  async getSanitizedState(sessionId: string, playerId: string) {
    return this.sessionsService.getSanitizedStateForPlayer(sessionId, playerId);
  }

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
    // Use the optimized service with DB-level pagination
    return this.historyService.listHistoryForUser(userId, options);
  }

  async getHistoryEntry(userId: string, roomId: string) {
    return this.historyService.getHistoryEntry(roomId, userId);
  }

  async hideHistoryEntry(userId: string, roomId: string) {
    return this.historyService.hideHistoryEntry(userId, roomId);
  }

  async getPlayerStats(userId: string) {
    return this.historyService.getPlayerStats(userId);
  }

  async getLeaderboard(limit?: number, offset?: number, gameId?: string) {
    return this.historyService.getLeaderboard(limit, offset, gameId);
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

  async declineInvitation(roomId: string, userId: string): Promise<void> {
    return this.rematchService.declineInvitation(roomId, userId);
  }

  async blockRematchRoom(roomId: string, userId: string): Promise<void> {
    return this.rematchService.blockRematchRoom(roomId, userId);
  }

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

  async findSessionByRoom(roomId: string) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (session) {
      if (session.gameId === 'sea_battle_v1') {
        await this.seaBattleService.findSessionByRoom(roomId);
      } else if (session.gameId === 'critical_v1') {
        await this.criticalService.findSessionByRoom(roomId);
      }
    }
    return session;
  }

  async ensureParticipant(roomId: string, userId: string) {
    const added = await this.roomsService.ensureParticipant(roomId, userId);
    const room = await this.roomsService.getRoom(roomId, userId);

    if (added) {
      this.realtimeService.emitPlayerJoined(room, userId);
    }

    return room;
  }

  async validateUserIds(userIds: string[]) {
    return this.utilities.validateUserIds(userIds);
  }

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

  async payoutGameWin(session: GameSessionSummary): Promise<void> {
    try {
      const sessionId = session.id;
      const winners = await this.sessionsService.getWinners(sessionId);
      if (winners.length === 0) return;

      const reward = await this.economy.getNumber('game_win_coin_reward');
      if (reward <= 0) return;

      for (const winnerId of winners) {
        try {
          await this.wallet.credit(
            winnerId,
            'coins',
            reward,
            'game_win',
            `game-${sessionId}-payout-${winnerId}`,
            { sessionId, gameId: session.gameId },
          );
        } catch (err) {
          this.logger.warn(
            `Game-win payout failed for session ${sessionId} winner ${winnerId}: ${(err as Error).message}`,
          );
        }
      }
    } catch (err) {
      this.logger.warn(
        `Failed to determine winners for session ${session.id}: ${(err as Error).message}`,
      );
    }
  }
}

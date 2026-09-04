import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { ChatScope } from './engines/base/game-engine.interface';
import { GameRoomsService } from './rooms/game-rooms.service';
import { GameSessionsService } from './sessions/game-sessions.service';
import { GameSessionsArchiveService } from './sessions/game-sessions.archive.service';
import { GamesHistoryFacade } from './games-history.facade';
import { GamesRealtimeService } from './games.realtime.service';
import { GameUtilitiesService } from './utilities/game-utilities.service';
import { AuthService } from '../auth/auth.service';
import { GameRuleVisibilityService } from '../admin/game-visibility/game-rule-visibility.service';
import { CreateGameRoomDto } from './dtos/create-game-room.dto';
import { JoinGameRoomDto } from './dtos/join-game-room.dto';
import { LeaveGameRoomDto } from './dtos/leave-game-room.dto';
import { DeleteGameRoomDto } from './dtos/delete-game-room.dto';
import { StartGameDto } from './dtos/start-game.dto';
import { StartGameSessionResult } from './games.types';
import { ListRoomsFilters } from './rooms/game-rooms.types';
import { GameRoomsQuickplayService } from './rooms/game-rooms.quickplay.service';
import { SeaBattleService } from './sea-battle/sea-battle.service';
import { CriticalService } from './critical/critical.service';
import { GamesLeaderboardSyncService } from './games.leaderboard-sync.service';
import { GamePostMatchService } from './game-post-match.service';
import { RankingService } from '../ranking/ranking.service';
import { recordRankedResultForSession } from './games.ranked-result';
import { finalizeCompletedSession } from './games.completion';
import { GameReplayService } from './replays/game-replay.service';
import { stripDisabledRules } from './games.service-rules';
import {
  sanitizeSessionForPlayer,
  touchEngineSession,
  type RematchHistoryOptions,
} from './games.service-helpers';

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);

  constructor(
    private readonly roomsService: GameRoomsService,
    private readonly sessionsService: GameSessionsService,
    private readonly archiveService: GameSessionsArchiveService,
    private readonly historyFacade: GamesHistoryFacade,
    private readonly realtimeService: GamesRealtimeService,
    private readonly utilities: GameUtilitiesService,
    private readonly authService: AuthService,
    private readonly roomsQuickplayService: GameRoomsQuickplayService,
    @Inject(forwardRef(() => SeaBattleService))
    private readonly seaBattleService: SeaBattleService,
    @Inject(forwardRef(() => CriticalService))
    private readonly criticalService: CriticalService,
    private readonly leaderboardSync: GamesLeaderboardSyncService,
    private readonly postMatch: GamePostMatchService,
    private readonly rankingService: RankingService,
    private readonly ruleVisibility: GameRuleVisibilityService,
    private readonly replayService: GameReplayService,
  ) {}

  // ========== Room Operations ==========

  async createRoom(userId: string, dto: CreateGameRoomDto) {
    const room = await this.roomsService.createRoom(userId, dto);
    this.realtimeService.emitRoomCreated(room);
    return room;
  }

  async countHostRooms(userId: string) {
    return this.roomsService.countHostRooms(userId);
  }

  async quickplay(
    userId: string,
    gameId: string,
    variant?: string,
    theme?: string,
  ) {
    return this.roomsQuickplayService.createQuickplayRoom(
      userId,
      gameId,
      variant,
      theme,
    );
  }

  async findHumanMatch(
    userId: string,
    gameId: string,
    variant?: string,
    theme?: string,
  ) {
    return this.roomsQuickplayService.findHumanMatch(
      userId,
      gameId,
      variant,
      theme,
    );
  }

  async listRooms(filters: ListRoomsFilters = {}, viewerId?: string) {
    return this.roomsService.listRooms(filters, viewerId);
  }

  async getRoom(roomId: string, userId?: string) {
    return this.roomsService.getRoom(roomId, userId);
  }

  async findRoomByInviteCode(code: string, viewerId?: string) {
    return this.roomsService.findByInviteCode(code, viewerId);
  }

  async getRoomSession(roomId: string, userId?: string) {
    const room = await this.roomsService.getRoom(roomId, userId);
    let session = await this.sessionsService.findSessionByRoom(roomId);

    if (session && userId) {
      try {
        session = sanitizeSessionForPlayer(
          this.sessionsService,
          session,
          userId,
        );
      } catch (err) {
        this.logger.warn(
          `Sanitization failed for user ${userId} in room ${roomId}: ${err}`,
        );
      }
    }

    return { room, session };
  }

  async joinRoom(dto: JoinGameRoomDto, userId: string, prevAnonId?: string) {
    const result = await this.roomsService.joinRoom(dto, userId, prevAnonId);
    const room = result.room;

    // Broadcast join event if new player
    if (result.added) {
      this.realtimeService.emitPlayerJoined(room, userId);
    }

    let session = dto.roomId
      ? await this.sessionsService.findSessionByRoom(dto.roomId)
      : null;

    // If not in OCI, try to load from Atlas (player rejoin after exit)
    if (!session && dto.roomId) {
      session = await this.archiveService.loadSessionFromAtlas(dto.roomId);
      if (session) {
        this.logger.log(
          `Loaded session ${session.id} from Atlas for room ${dto.roomId}`,
        );
      }
    }

    // Trigger bot if exists
    if (session) {
      await touchEngineSession(
        session,
        this.seaBattleService,
        this.criticalService,
      );
    }

    return { room, session };
  }

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
          // Archive completed session to Atlas
          await this.archiveService.archiveSessionToAtlas(updatedSession);
        } else if (updatedSession.status === 'active') {
          // Archive active session to Atlas before player exit
          await this.archiveService.archiveSessionToAtlas(updatedSession);
          // Delete from OCI (free up resources, player can rejoin from Atlas)
          await this.archiveService.deleteSessionFromOci(updatedSession.id);
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

  async deleteRoom(dto: DeleteGameRoomDto, userId: string) {
    const result = await this.roomsService.deleteRoom(dto, userId);

    // Emit real-time event
    this.realtimeService.emitRoomDeleted(dto.roomId);

    return result;
  }

  async startGameSession(
    dto: StartGameDto,
    userId: string,
  ): Promise<StartGameSessionResult> {
    const { roomId } = dto;

    const room = await this.roomsService.getRoom(roomId, userId);

    if (room.hostId !== userId) {
      throw new Error('Only the host can start the game');
    }

    const playerIds = await this.roomsService.getRoomParticipants(roomId);

    const session = await this.sessionsService.createSession({
      roomId,
      gameId: room.gameId,
      playerIds,
      config: { engine: dto.engine, ...room.gameOptions },
    });

    await this.roomsService.updateRoomStatus(roomId, 'in_progress');
    const updatedRoom = { ...room, status: 'in_progress' as const };

    // Mark players as in-match for the leaderboard LIVE chip.
    await this.leaderboardSync.syncInMatch(playerIds, true);

    // Emit real-time event
    await this.realtimeService.emitGameStarted(updatedRoom, session, (s, pId) =>
      sanitizeSessionForPlayer(this.sessionsService, s, pId),
    );

    return { room: updatedRoom, session };
  }

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

    const isCompleted = session.status === 'completed';
    // Ranked matches: apply ELO before broadcasting so the delta lands in `state.gameResult.ratingDeltas`.
    const completedPlayers = isCompleted
      ? await recordRankedResultForSession(
          session,
          this.roomsService,
          this.sessionsService,
          this.rankingService,
          this.logger,
        )
      : null;

    await this.realtimeService.emitActionExecuted(
      session,
      action,
      userId,
      (s, pId) => sanitizeSessionForPlayer(this.sessionsService, s, pId),
    );

    if (isCompleted) {
      const players =
        completedPlayers ??
        (await this.roomsService.getRoomParticipants(session.roomId));
      await finalizeCompletedSession(session, players, {
        roomsService: this.roomsService,
        sessionsService: this.sessionsService,
        leaderboardSync: this.leaderboardSync,
        postMatch: this.postMatch,
        archiveService: this.archiveService,
        replayService: this.replayService,
        logger: this.logger,
      });
    }

    return session;
  }

  async getSanitizedState(sessionId: string, playerId: string) {
    return this.sessionsService.getSanitizedStateForPlayer(sessionId, playerId);
  }

  async getAvailableActions(sessionId: string, playerId: string) {
    return this.sessionsService.getAvailableActions(sessionId, playerId);
  }

  async revertLastMove(sessionId: string) {
    return this.sessionsService.revertToPreviousState(sessionId);
  }

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
    return this.historyFacade.listHistoryForUser(userId, options);
  }

  async getHistoryEntry(userId: string, roomId: string) {
    return this.historyFacade.getHistoryEntry(userId, roomId);
  }

  async hideHistoryEntry(userId: string, roomId: string) {
    return this.historyFacade.hideHistoryEntry(userId, roomId);
  }

  async getPlayerStats(userId: string) {
    return this.historyFacade.getPlayerStats(userId);
  }

  async syncPlayerStats(
    userId: string,
    records: Array<{
      gameId: string;
      result: 'won' | 'lost' | 'draw';
      timestamp: number;
      sessionId: string;
    }>,
  ) {
    return this.historyFacade.syncPlayerStats(userId, records);
  }

  async getLeaderboard(limit?: number, offset?: number, gameId?: string) {
    return this.historyFacade.getLeaderboard(limit, offset, gameId);
  }

  async getHeadToHead(userId1: string, userId2: string, gameId?: string) {
    return this.historyFacade.getHeadToHead(userId1, userId2, gameId);
  }

  async getTrends(userId: string, gameId?: string, limit = 10) {
    return this.historyFacade.getTrends(userId, gameId, limit);
  }

  async createRematchFromHistory(
    userId: string,
    roomId: string,
    participantIds: string[],
    options?: RematchHistoryOptions,
  ) {
    return this.historyFacade.createRematchFromHistory(
      userId,
      roomId,
      participantIds,
      options,
    );
  }

  async declineInvitation(roomId: string, userId: string): Promise<void> {
    return this.historyFacade.declineInvitation(roomId, userId);
  }

  async blockRematchRoom(roomId: string, userId: string): Promise<void> {
    return this.historyFacade.blockRematchRoom(roomId, userId);
  }

  async reinvitePlayers(
    roomId: string,
    hostId: string,
    userIds: string[],
  ): Promise<void> {
    return this.historyFacade.reinvitePlayers(roomId, hostId, userIds);
  }

  async postHistoryNote(
    roomId: string,
    userId: string,
    message: string,
    scope: ChatScope = 'all',
    isAuthenticated = false,
  ) {
    await this.historyFacade.postHistoryNote(
      roomId,
      userId,
      message,
      scope,
      (s, pId) => sanitizeSessionForPlayer(this.sessionsService, s, pId),
      isAuthenticated,
    );
  }

  async postRoomChat(
    roomId: string,
    userId: string,
    senderName: string,
    message: string,
    scope: string,
  ) {
    return this.roomsService.postRoomChat(
      roomId,
      userId,
      senderName,
      message,
      scope,
    );
  }

  async deleteRoomChatMessage(
    roomId: string,
    callerId: string,
    messageId: string,
  ) {
    return this.roomsService.deleteRoomChatMessage(roomId, callerId, messageId);
  }

  async findSessionByRoom(roomId: string) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (session) {
      await touchEngineSession(
        session,
        this.seaBattleService,
        this.criticalService,
      );
    }
    return session;
  }

  async ensureParticipant(roomId: string, userId: string) {
    const added = await this.roomsService.ensureParticipant(roomId, userId);
    const room = await this.roomsService.getRoom(roomId, userId);
    if (added) this.realtimeService.emitPlayerJoined(room, userId);
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
    try {
      const room = await this.roomsService.getRoom(roomId);
      const ruleMap = await this.ruleVisibility.getRulesForGame(room.gameId);
      stripDisabledRules(options, ruleMap);
    } catch (err) {
      this.logger.warn(
        `Rule stripping failed for room ${roomId}: ${err}. Proceeding without stripping.`,
      );
    }
    const updated = await this.roomsService.updateRoomOptions(
      roomId,
      userId,
      options,
    );
    this.realtimeService.emitRoomUpdated(updated);
    return updated;
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
    this.realtimeService.emitRoomUpdate(room);
    return room;
  }
}

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ChatScope } from './engines/base/game-engine.interface';
import { GameHistoryService } from './history/game-history.service';
import { GameSessionsService } from './sessions/game-sessions.service';
import { GamesRealtimeService } from './games.realtime.service';
import { GamesRematchService } from './games.rematch.service';
import { PlayerStatsService } from './player-stats.service';
import type { GameSessionSummary } from './sessions/game-sessions.service';

/**
 * Games History Facade
 * Delegates history-related operations from GamesService
 */
@Injectable()
export class GamesHistoryFacade {
  private readonly logger = new Logger(GamesHistoryFacade.name);

  constructor(
    private readonly historyService: GameHistoryService,
    private readonly sessionsService: GameSessionsService,
    private readonly realtimeService: GamesRealtimeService,
    private readonly rematchService: GamesRematchService,
    private readonly playerStats: PlayerStatsService,
  ) {}

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

  async syncPlayerStats(
    userId: string,
    records: Array<{
      gameId: string;
      result: 'won' | 'lost' | 'draw';
      timestamp: number;
      sessionId: string;
    }>,
  ) {
    return this.playerStats.syncRecords(userId, records);
  }

  async getLeaderboard(limit?: number, offset?: number, gameId?: string) {
    return this.historyService.getLeaderboard(limit, offset, gameId);
  }

  async getHeadToHead(userId1: string, userId2: string, gameId?: string) {
    return this.playerStats.getHeadToHead(userId1, userId2, gameId);
  }

  async getTrends(userId: string, gameId?: string, limit = 10) {
    return this.playerStats.getTrends(userId, gameId, limit);
  }

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

  async postHistoryNote(
    roomId: string,
    userId: string,
    message: string,
    scope: ChatScope,
    sanitizeForPlayer: (
      s: GameSessionSummary,
      pId: string,
    ) => GameSessionSummary,
    isAuthenticated = false,
  ) {
    // Best-effort: try to write to Atlas history and validate anonymous
    // participation. Quick-play rooms may only exist in OCI, so a
    // NotFoundException here is non-fatal — the OCI path below is authoritative.
    try {
      await this.historyService.postHistoryNote(
        roomId,
        userId,
        message,
        scope,
        isAuthenticated,
      );
    } catch (err) {
      if (err instanceof NotFoundException) {
        this.logger.debug(
          `Room ${roomId} not found in Atlas — skipping Atlas history write (quick-play room)`,
        );
      } else {
        throw err;
      }
    }

    // Write the chat message via the sessions service (OCI connection)
    // instead of re-reading from a potentially stale Atlas snapshot.
    // pushChatLog writes to OCI and returns the updated session.
    const senderName = await this.historyService.getUserDisplayName(userId);
    const session = await this.sessionsService.pushChatLog(
      roomId,
      userId,
      message,
      scope,
      senderName || undefined,
    );

    if (session) {
      await this.realtimeService.emitSessionSnapshot(
        roomId,
        session,
        (s, pId) => sanitizeForPlayer(s, pId),
      );
    }
  }
}

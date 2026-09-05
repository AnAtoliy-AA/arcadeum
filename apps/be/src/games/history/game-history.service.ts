import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, Types } from 'mongoose';
import { GameSession } from '../schemas/game-session.schema';
import { GameRoom } from '../schemas/game-room.schema';
import { GameHistoryHidden } from '../schemas/game-history-hidden.schema';
import { User } from '../../auth/schemas/user.schema';
import { HistoryRematchDto } from '../dtos/history-rematch.dto';
import {
  HistoryParticipantSummary,
  GameHistorySummary,
  GroupedHistorySummary,
  PlayerStats,
  LeaderboardEntry,
} from './game-history.types';
import { GameHistoryBuilderService } from './game-history-builder.service';
import { GameHistoryStatsService } from './game-history-stats.service';
import { GameHistoryRematchService } from './game-history-rematch.service';
import { escapeRegExp } from '../../common/utils/escape-regexp';
import { isValidStatus } from '../game-validation.util';
import {
  BaseGameState,
  ChatScope,
} from '../engines/base/game-engine.interface';
import {
  ATLAS_CONNECTION,
  OCI_CONNECTION,
} from '../../common/providers/mongo-connections.provider';
@Injectable()
export class GameHistoryService {
  constructor(
    private readonly builder: GameHistoryBuilderService,
    private readonly statsService: GameHistoryStatsService,
    private readonly rematchService: GameHistoryRematchService,
    @Optional()
    @InjectModel(GameSession.name, ATLAS_CONNECTION)
    private readonly gameSessionModel?: Model<GameSession>,
    @Optional()
    @InjectModel(GameRoom.name, ATLAS_CONNECTION)
    private readonly gameRoomModel?: Model<GameRoom>,
    @Optional()
    @InjectModel(GameHistoryHidden.name, ATLAS_CONNECTION)
    private readonly historyHiddenModel?: Model<GameHistoryHidden>,
    @Optional()
    @InjectModel(User.name, ATLAS_CONNECTION)
    private readonly userModel?: Model<User>,
    @Optional()
    @InjectModel(GameRoom.name, OCI_CONNECTION)
    private readonly ociRoomModel?: Model<GameRoom>,
  ) {}
  private get atlasReady(): boolean {
    return !!(
      this.gameRoomModel &&
      this.gameSessionModel &&
      this.historyHiddenModel
    );
  }

  async getUserDisplayName(userId: string): Promise<string> {
    if (!this.userModel) return '';
    try {
      const user = await this.userModel
        .findById(userId)
        .select('displayName username')
        .lean()
        .exec();
      return user?.displayName ?? user?.username ?? '';
    } catch {
      return '';
    }
  }

  async listHistoryForUser(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      grouped?: boolean;
      cursor?: string;
    } = {},
  ): Promise<{
    entries: GameHistorySummary[] | GroupedHistorySummary[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
    nextCursor?: string;
  }> {
    if (!this.atlasReady)
      return { entries: [], total: 0, page: 0, limit: 20, hasMore: false };
    if (typeof userId !== 'string')
      throw new BadRequestException('Invalid userId');
    // codeql[js/sql-injection] This is a MongoDB/Mongoose query, not SQL. User input is sanitized via escapeRegExp().
    if (options.search != null && typeof options.search !== 'string')
      throw new BadRequestException('Invalid search');
    if (options.status != null && typeof options.status !== 'string')
      throw new BadRequestException('Invalid status');
    const page = options.page || 0;
    const limit = options.limit || 20;
    const hiddenEntries = await this.historyHiddenModel!.find({ userId })
      .select('roomId')
      .lean()
      .exec();
    const hiddenRoomIds = hiddenEntries.map((h) => h.roomId);
    const orFilters: FilterQuery<GameRoom>[] = [
      { hostId: userId },
      { 'participants.userId': userId },
    ];
    if (options.search) {
      const trimmed = options.search.trim().slice(0, 100);
      if (trimmed)
        orFilters.push({ name: new RegExp(escapeRegExp(trimmed), 'i') });
    }
    const query: FilterQuery<GameRoom> = {
      $or: orFilters,
      _id: { $nin: hiddenRoomIds },
    };
    if (options.status && !options.grouped) {
      const normalizedStatus = options.status.trim();
      if (!isValidStatus(normalizedStatus)) {
        throw new BadRequestException('Invalid status value');
      }
      query.status = { $eq: normalizedStatus };
    }

    // Cursor-based pagination: use _id as cursor for O(1) page lookups
    // instead of skip(N) which scans and discards N documents.
    if (options.cursor) {
      query._id = {
        $lt: new Types.ObjectId(options.cursor),
        $nin: hiddenRoomIds,
      };
    } else {
      query._id = { $nin: hiddenRoomIds };
    }

    const total = await this.gameRoomModel!.countDocuments({
      $or: orFilters,
      _id: { $nin: hiddenRoomIds },
      ...(options.status && !options.grouped
        ? { status: { $eq: options.status.trim() } }
        : {}),
    }).exec();
    const rooms = await this.gameRoomModel!.find(query)
      .select(
        'hostId gameId name status visibility participants updatedAt gameOptions',
      )
      .sort({ updatedAt: -1, _id: -1 })
      .limit(limit + 1)
      .lean()
      .exec();

    const hasMore = rooms.length > limit;
    if (hasMore) rooms.pop();

    const roomIds = rooms.map((r) => r._id.toString());
    const sessions = await this.gameSessionModel!.find({
      roomId: { $in: roomIds },
    })
      .select('roomId gameId status state createdAt updatedAt')
      .sort({ createdAt: -1 })
      .limit(roomIds.length * 50)
      .lean()
      .exec();
    let entries: GameHistorySummary[] | GroupedHistorySummary[];
    if (options.grouped) {
      entries = await this.builder.buildGroupedHistory(
        rooms as unknown as GameRoom[],
        sessions as unknown as GameSession[],
      );
    } else {
      entries = await this.builder.buildHistoryList(
        rooms as unknown as GameRoom[],
        sessions as unknown as GameSession[],
      );
    }
    return {
      entries,
      total,
      page,
      limit,
      hasMore,
      nextCursor:
        hasMore && rooms.length > 0
          ? rooms[rooms.length - 1]._id.toString()
          : undefined,
    };
  }

  /**
   * Get a specific history entry
   */
  async getHistoryEntry(
    roomId: string,
    userId: string,
  ): Promise<{
    summary: {
      roomId: string;
      sessionId: string | null;
      gameId: string;
      roomName: string;
      status: string;
      name?: string;
      visibility?: 'public' | 'private';
      gameOptions?: Record<string, unknown>;
      startedAt: string | null;
      completedAt: string | null;
      lastActivityAt: string;
      host: HistoryParticipantSummary;
      participants: HistoryParticipantSummary[];
    };
    logs: Array<{
      id: string;
      type: 'system' | 'action' | 'message';
      message: string;
      createdAt: string;
      scope?: ChatScope;
      sender?: HistoryParticipantSummary;
    }>;
  }> {
    if (!this.atlasReady)
      throw new NotFoundException('History service unavailable');
    const room = await this.gameRoomModel!.findById(roomId).lean().exec();

    if (!room) {
      throw new NotFoundException(`Room not found: ${roomId}`);
    }

    const isParticipant =
      room.hostId === userId ||
      room.participants.some((p) => p.userId === userId);

    if (!isParticipant) {
      throw new BadRequestException('You were not a participant in this game');
    }

    const sessions = await this.gameSessionModel!.find({ roomId })
      .select('roomId gameId status state createdAt updatedAt')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()
      .exec();

    // Get participant summaries
    const participants = await this.builder.getParticipantSummaries(
      room as unknown as GameRoom,
    );

    // Find the latest session for this room
    const latestSession = sessions[0] || null;

    // Extract logs from the latest session
    const logs: Array<{
      id: string;
      type: 'system' | 'action' | 'message';
      message: string;
      createdAt: string;
      scope?: ChatScope;
      sender?: HistoryParticipantSummary;
    }> = [];

    if (latestSession && latestSession.state) {
      const state = latestSession.state as unknown as BaseGameState;
      const sessionLogs = state.logs || [];
      for (const log of sessionLogs) {
        // Filter private messages meant for others
        if (log.scope === 'private' && log.senderId !== userId) {
          continue;
        }

        let sender: HistoryParticipantSummary | undefined;
        if (log.senderId) {
          sender = participants.find((p) => p.id === log.senderId);
        }

        logs.push({
          id: log.id || globalThis.crypto.randomUUID().slice(0, 12),
          type: log.type || 'system',
          message: log.message || '',
          createdAt: log.createdAt || new Date().toISOString(),
          scope: log.scope || 'all',
          sender,
        });
      }
    }

    const host = participants.find((p) => p.isHost) || participants[0];
    return {
      summary: {
        roomId: room._id.toString(),
        sessionId: latestSession ? latestSession._id.toString() : null,
        gameId: room.gameId,
        roomName: room.name,
        status: room.status,
        startedAt: latestSession ? latestSession.createdAt.toISOString() : null,
        completedAt: latestSession
          ? latestSession.updatedAt.toISOString()
          : null,
        lastActivityAt: room.updatedAt.toISOString(),
        host,
        participants,
      },
      logs,
    };
  }

  /**
   * Hide a history entry for a user
   */
  async hideHistoryEntry(userId: string, roomId: string): Promise<void> {
    if (!this.gameRoomModel || !this.historyHiddenModel) return;
    const room = await this.gameRoomModel.findById(roomId).lean().exec();
    if (!room) throw new NotFoundException(`Room not found: ${roomId}`);

    const isParticipant =
      room.hostId === userId ||
      room.participants.some((p) => p.userId === userId);
    if (!isParticipant)
      throw new BadRequestException('You were not a participant in this game');

    const existing = await this.historyHiddenModel
      .findOne({ userId, roomId })
      .lean()
      .exec();
    if (existing) return;

    await this.historyHiddenModel.create({
      userId,
      roomId,
      hiddenAt: new Date(),
    });
  }

  async createRematchFromHistory(
    dto: HistoryRematchDto,
    userId: string,
  ): Promise<{ id: string; invitedIds: string[] }> {
    return this.rematchService.createRematchFromHistory(dto, userId);
  }

  /**
   * Post a note to game history logs
   */
  async postHistoryNote(
    roomId: string,
    userId: string,
    message: string,
    scope: ChatScope,
    isAuthenticated = false,
  ): Promise<void> {
    if (!this.gameRoomModel || !this.gameSessionModel) return;
    const room = await this.gameRoomModel.findById(roomId).lean().exec();

    if (!room) {
      throw new NotFoundException(`Room not found: ${roomId}`);
    }

    // Anonymous users must be participants to chat
    if (!isAuthenticated) {
      const isParticipant =
        room.hostId === userId ||
        room.participants.some((p) => p.userId === userId);

      if (!isParticipant) {
        throw new BadRequestException(
          'You were not a participant in this game',
        );
      }
    }

    // Get latest session for this room
    const session = await this.gameSessionModel
      .findOne({ roomId })
      .sort({ createdAt: -1 })
      .exec();

    if (!session) {
      // No session yet (lobby state) — silently skip, lobby has its own room chat
      return;
    }
    // Add message to logs in session state
    const logEntry = {
      id: globalThis.crypto.randomUUID().slice(0, 12),
      type: 'message' as const,
      message,
      createdAt: new Date().toISOString(),
      scope,
      senderId: userId,
      senderName: null,
    };

    const state = session.state as unknown as BaseGameState;
    if (!state.logs) {
      state.logs = [];
    }

    state.logs.push(logEntry);
    if (state.logs.length > 500) {
      state.logs = state.logs.slice(-500);
    }
    session.markModified('state');
    await session.save();
  }

  async getPlayerStats(userId: string): Promise<PlayerStats> {
    return this.statsService.getPlayerStats(userId);
  }

  async getLeaderboard(
    limit = 20,
    offset = 0,
    gameId?: string,
  ): Promise<{ entries: LeaderboardEntry[]; hasMore: boolean; total: number }> {
    return this.statsService.getLeaderboard(limit, offset, gameId);
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
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
import { escapeRegExp } from '../../common/utils/escape-regexp';
import { isValidStatus } from '../game-validation.util';
import {
  BaseGameState,
  ChatScope,
} from '../engines/base/game-engine.interface';
import { ATLAS_CONNECTION } from '../../common/providers/mongo-connections.provider';
@Injectable()
export class GameHistoryService {
  constructor(
    private readonly builder: GameHistoryBuilderService,
    private readonly statsService: GameHistoryStatsService,
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
  ) {}
  private get atlasReady(): boolean {
    return !!(
      this.gameRoomModel &&
      this.gameSessionModel &&
      this.historyHiddenModel
    );
  }
  async listHistoryForUser(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      grouped?: boolean;
    } = {},
  ): Promise<{
    entries: GameHistorySummary[] | GroupedHistorySummary[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }> {
    if (!this.atlasReady)
      return { entries: [], total: 0, page: 0, limit: 20, hasMore: false };
    if (typeof userId !== 'string')
      throw new BadRequestException('Invalid userId');
    if (options.search != null && typeof options.search !== 'string')
      throw new BadRequestException('Invalid search');
    if (options.status != null && typeof options.status !== 'string')
      throw new BadRequestException('Invalid status');
    const page = options.page || 0;
    const limit = options.limit || 20;
    const skip = page * limit;
    const hiddenEntries = await this.historyHiddenModel!.find({ userId })
      .select('roomId')
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
    const total = await this.gameRoomModel!.countDocuments(query).exec();
    const rooms = await this.gameRoomModel!.find(query)
      .select(
        'hostId gameId name status visibility participants updatedAt gameOptions',
      )
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

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
      hasMore: skip + entries.length < total,
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
    if (!this.gameRoomModel)
      throw new NotFoundException('History service unavailable');
    const { roomId: originalRoomId, participantIds } = dto;

    // Get original room
    const originalRoom = await this.gameRoomModel
      .findById(originalRoomId)
      .lean()
      .exec();

    if (!originalRoom) {
      throw new NotFoundException(`Original room not found: ${originalRoomId}`);
    }

    // Check if user was a participant
    const isParticipant =
      originalRoom.hostId === userId ||
      originalRoom.participants.some((p) => p.userId === userId);

    if (!isParticipant) {
      throw new BadRequestException(
        'You were not a participant in the original game',
      );
    }

    // Determine which participants to invite
    // If participantIds is provided and not empty, use those
    // Otherwise, invite all original participants (except the new host)
    const originalParticipantIds = originalRoom.participants
      .map((p) => p.userId)
      .filter((id) => id !== userId);

    const invitedIds =
      participantIds && participantIds.length > 0
        ? participantIds.filter((id) => id !== userId) // filter out host
        : originalParticipantIds;

    // Build participants array: host + any bots that were stamped into the
    // carried-over team config. Without this, team-mode rematches start with
    // empty seats — startSession then fails with "Not enough players" because
    // the bot ids referenced in teams aren't actually room participants.
    const now = new Date();
    const participants: { userId: string; joinedAt: Date }[] = [
      { userId, joinedAt: now },
    ];
    const carriedOptions = dto.gameOptions || originalRoom.gameOptions || {};
    const carriedTeams = (
      carriedOptions as {
        teams?: { playerIds?: string[]; targetSize?: number }[];
      }
    ).teams;
    if (Array.isArray(carriedTeams)) {
      const seen = new Set<string>([userId]);
      for (const team of carriedTeams) {
        if (!Array.isArray(team.playerIds)) continue;
        for (const pid of team.playerIds) {
          if (typeof pid !== 'string') continue;
          if (!pid.startsWith('bot-')) continue;
          if (seen.has(pid)) continue;
          seen.add(pid);
          participants.push({ userId: pid, joinedAt: now });
        }
      }
    }

    // In team mode the room cap must accommodate the team config (up to 8 in
    // MAX_PLAYERS_TEAM_MODE). Without this bump, rematching out of a small
    // FFA-sized room (maxPlayers=5/6) into a team game leaves the lobby
    // showing "8 / 6" once the bots get added.
    const rematchMaxPlayers = Array.isArray(carriedTeams)
      ? Math.max(
          originalRoom.maxPlayers ?? 0,
          carriedTeams.reduce(
            (sum, t) =>
              sum + (typeof t.targetSize === 'number' ? t.targetSize : 0),
            0,
          ),
          participants.length,
        )
      : originalRoom.maxPlayers;

    // Generate rematch name: "someName" -> "someName Rematch 1" -> "someName Rematch 2"
    // Extract base name (strip existing " Rematch N" suffix if present)
    const rematchSuffixMatch = originalRoom.name.match(/^(.+?) Rematch \d+$/);
    const baseName = rematchSuffixMatch
      ? rematchSuffixMatch[1]
      : originalRoom.name;

    // Find existing rematch rooms with the same base name
    const escapedBaseName = escapeRegExp(baseName);
    const existingRematches = await this.gameRoomModel
      .find({
        name: { $regex: new RegExp(`^${escapedBaseName} Rematch \\d+$`) },
      })
      .select('name')
      .lean()
      .exec();

    const usedNumbers = new Set(
      existingRematches
        .map((r) => {
          const match = r.name.match(/ Rematch (\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter((n) => n > 0),
    );

    let rematchNumber = 1;
    while (usedNumbers.has(rematchNumber)) {
      rematchNumber++;
    }
    const rematchName = `${baseName} Rematch ${rematchNumber}`;

    // Create new room with same settings
    const newRoom = await this.gameRoomModel.create({
      gameId: originalRoom.gameId,
      name: rematchName,
      hostId: userId,
      visibility: originalRoom.visibility,
      maxPlayers: rematchMaxPlayers,
      participants,
      status: 'lobby',
      createdAt: now,
      updatedAt: now,
      gameOptions: {
        ...(dto.gameOptions || originalRoom.gameOptions || {}),
        rematchInvitedIds: invitedIds,
        rematchMessage: dto.message,
        rematchPreviousRoomId: originalRoomId,
      },
    });

    return { id: newRoom._id.toString(), invitedIds };
  }

  /**
   * Post a note to game history logs
   */
  async postHistoryNote(
    roomId: string,
    userId: string,
    message: string,
    scope: ChatScope,
  ): Promise<void> {
    if (!this.gameRoomModel || !this.gameSessionModel) return;
    const room = await this.gameRoomModel.findById(roomId).lean().exec();

    if (!room) {
      throw new NotFoundException(`Room not found: ${roomId}`);
    }

    // Check if user was a participant
    const isParticipant =
      room.hostId === userId ||
      room.participants.some((p) => p.userId === userId);

    if (!isParticipant) {
      throw new BadRequestException('You were not a participant in this game');
    }

    // Get latest session for this room
    const session = await this.gameSessionModel
      .findOne({ roomId })
      .sort({ createdAt: -1 })
      .exec();

    if (!session) {
      throw new NotFoundException('No session found for this room');
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

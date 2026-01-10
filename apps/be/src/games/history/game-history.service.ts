import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameSession } from '../schemas/game-session.schema';
import { ChatScope } from '../engines/base/game-engine.interface';
import { GameRoom } from '../schemas/game-room.schema';
import { GameHistoryHidden } from '../schemas/game-history-hidden.schema';
import { User } from '../../auth/schemas/user.schema';
import { HistoryRematchDto } from '../dtos/history-rematch.dto';
import {
  HistoryParticipantSummary,
  GameHistorySummary,
  GroupedHistorySummary,
} from './game-history.types';
import { GameHistoryBuilderService } from './game-history-builder.service';
import { BaseGameState } from '../engines/base/game-engine.interface';

/**
 * Game History Service
 * Handles game history tracking, viewing, and rematch functionality
 */
@Injectable()
export class GameHistoryService {
  constructor(
    @InjectModel(GameSession.name)
    private readonly gameSessionModel: Model<GameSession>,
    @InjectModel(GameRoom.name)
    private readonly gameRoomModel: Model<GameRoom>,
    @InjectModel(GameHistoryHidden.name)
    private readonly historyHiddenModel: Model<GameHistoryHidden>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly builder: GameHistoryBuilderService,
  ) {}

  /**
   * List game history for a user
   * @param userId User ID
   * @param grouped Whether to group by room
   */
  async listHistoryForUser(
    userId: string,
    grouped = false,
  ): Promise<GameHistorySummary[] | GroupedHistorySummary[]> {
    // Get hidden history entries for this user
    const hiddenEntries = await this.historyHiddenModel
      .find({ userId })
      .select('roomId')
      .exec();

    const hiddenRoomIds = hiddenEntries.map((h) => h.roomId);

    // Find rooms where user participated
    const rooms = await this.gameRoomModel
      .find({
        $or: [{ hostId: userId }, { 'participants.userId': userId }],
        _id: { $nin: hiddenRoomIds },
      })
      .exec();

    const roomIds = rooms.map((r) => r._id.toString());

    // Find sessions for these rooms
    const sessions = await this.gameSessionModel
      .find({ roomId: { $in: roomIds } })
      .sort({ createdAt: -1 })
      .exec();

    if (grouped) {
      return this.builder.buildGroupedHistory(rooms, sessions);
    }

    return this.builder.buildHistoryList(rooms, sessions);
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
    const room = await this.gameRoomModel.findById(roomId).exec();

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

    // Get all sessions for this room
    const sessions = await this.gameSessionModel
      .find({ roomId })
      .sort({ createdAt: -1 })
      .exec();

    // Get participant summaries
    const participants = await this.builder.getParticipantSummaries(room);

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
          id: log.id || Math.random().toString(36).substring(7),
          type: log.type || 'system',
          message: log.message || '',
          createdAt: log.createdAt || new Date().toISOString(),
          scope: log.scope || 'all',
          sender,
        });
      }
    }

    // Build summary
    const host = participants.find((p) => p.isHost) || participants[0];
    const summary = {
      roomId: room._id.toString(),
      sessionId: latestSession ? latestSession._id.toString() : null,
      gameId: room.gameId,
      roomName: room.name,
      status: room.status,
      startedAt: latestSession ? latestSession.createdAt.toISOString() : null,
      completedAt: latestSession ? latestSession.updatedAt.toISOString() : null,
      lastActivityAt: room.updatedAt.toISOString(),
      host,
      participants,
    };

    return {
      summary,
      logs,
    };
  }

  /**
   * Hide a history entry for a user
   */
  async hideHistoryEntry(userId: string, roomId: string): Promise<void> {
    const room = await this.gameRoomModel.findById(roomId).exec();

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

    // Check if already hidden
    const existing = await this.historyHiddenModel
      .findOne({ userId, roomId })
      .exec();

    if (existing) {
      return; // Already hidden
    }

    // Create hidden entry
    await this.historyHiddenModel.create({
      userId,
      roomId,
      hiddenAt: new Date(),
    });
  }

  /**
   * Create a rematch from a history entry
   */
  async createRematchFromHistory(
    dto: HistoryRematchDto,
    userId: string,
  ): Promise<string> {
    const { roomId: originalRoomId, participantIds } = dto;

    // Get original room
    const originalRoom = await this.gameRoomModel
      .findById(originalRoomId)
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

    // Build participants array: host first, then invited players
    const now = new Date();
    const participants = [
      {
        userId,
        joinedAt: now,
      },
      ...invitedIds.map((invitedUserId) => ({
        userId: invitedUserId,
        joinedAt: now,
      })),
    ];

    // Generate rematch name: "someName" -> "someName Rematch 1" -> "someName Rematch 2"
    // Extract base name (strip existing " Rematch N" suffix if present)
    const rematchSuffixMatch = originalRoom.name.match(/^(.+?) Rematch \d+$/);
    const baseName = rematchSuffixMatch
      ? rematchSuffixMatch[1]
      : originalRoom.name;

    // Find existing rematch rooms with the same base name
    const escapedBaseName = baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
      maxPlayers: originalRoom.maxPlayers,
      participants,
      status: 'lobby',
      createdAt: now,
      updatedAt: now,
      gameOptions: dto.gameOptions || originalRoom.gameOptions,
    });

    return newRoom._id.toString();
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
    const room = await this.gameRoomModel.findById(roomId).exec();

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
      id: Math.random().toString(36).substring(7),
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
    session.markModified('state');
    await session.save();
  }
}

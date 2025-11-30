import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameSession } from '../schemas/game-session.schema';
import { GameRoom } from '../schemas/game-room.schema';
import { GameHistoryHidden } from '../schemas/game-history-hidden.schema';
import { User } from '../../auth/schemas/user.schema';
import { HistoryRematchDto } from '../dtos/history-rematch.dto';

export interface HistoryParticipantSummary {
  id: string;
  username: string;
  email: string | null;
  isHost: boolean;
}

export interface GameHistorySummary {
  id: string;
  roomId: string;
  gameId: string;
  gameName: string;
  startedAt: string;
  completedAt: string | null;
  status: 'completed' | 'abandoned';
  participants: HistoryParticipantSummary[];
  hostId: string;
  result?: {
    winners: string[];
    finalState: Record<string, any>;
  };
}

export interface GroupedHistorySummary {
  roomId: string;
  gameId: string;
  gameName: string;
  hostId: string;
  participants: HistoryParticipantSummary[];
  sessions: Array<{
    id: string;
    startedAt: string;
    completedAt: string | null;
    status: string;
    winners?: string[];
  }>;
  totalSessions: number;
  latestSessionAt: string;
}

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
      return this.buildGroupedHistory(rooms, sessions);
    }

    return this.buildHistoryList(rooms, sessions);
  }

  /**
   * Get a specific history entry
   */
  async getHistoryEntry(
    roomId: string,
    userId: string,
  ): Promise<{
    room: any;
    sessions: any[];
    participants: HistoryParticipantSummary[];
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

    // Get user details for participants
    const userIds = [
      room.hostId,
      ...room.participants.map((p) => p.userId),
    ];
    const uniqueUserIds = Array.from(new Set(userIds));

    const users = await this.userModel
      .find({ _id: { $in: uniqueUserIds } })
      .select('username email')
      .exec();

    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    const participants: HistoryParticipantSummary[] = uniqueUserIds.map(
      (uid) => {
        const user = userMap.get(uid);
        return {
          id: uid,
          username: user?.username || 'Unknown',
          email: user?.email || null,
          isHost: uid === room.hostId,
        };
      },
    );

    return {
      room,
      sessions,
      participants,
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
    const { roomId: originalRoomId } = dto;

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

    // Create new room with same settings
    const newRoom = await this.gameRoomModel.create({
      gameId: originalRoom.gameId,
      name: `${originalRoom.name} (Rematch)`,
      hostId: userId,
      visibility: originalRoom.visibility,
      maxPlayers: originalRoom.maxPlayers,
      participants: [
        {
          userId,
          joinedAt: new Date(),
        },
      ],
      status: 'lobby',
      createdAt: new Date(),
      updatedAt: new Date(),
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
      scope: 'all' as const,
      senderId: userId,
      senderName: null,
    };

    if (!session.state.logs) {
      session.state.logs = [];
    }

    session.state.logs.push(logEntry);
    session.markModified('state');
    await session.save();
  }

  // ========== Private Helper Methods ==========

  private async buildHistoryList(
    rooms: GameRoom[],
    sessions: GameSession[],
  ): Promise<GameHistorySummary[]> {
    const sessionsByRoom = new Map<string, GameSession[]>();

    sessions.forEach((session) => {
      const roomId = session.roomId;
      if (!sessionsByRoom.has(roomId)) {
        sessionsByRoom.set(roomId, []);
      }
      sessionsByRoom.get(roomId)!.push(session);
    });

    const history: GameHistorySummary[] = [];

    for (const room of rooms) {
      const roomId = room._id.toString();
      const roomSessions = sessionsByRoom.get(roomId) || [];

      for (const session of roomSessions) {
        const participants = await this.getParticipantSummaries(room);

        history.push({
          id: session._id.toString(),
          roomId,
          gameId: room.gameId,
          gameName: room.name,
          startedAt: session.createdAt.toISOString(),
          completedAt: session.updatedAt.toISOString(),
          status: session.status === 'completed' ? 'completed' : 'abandoned',
          participants,
          hostId: room.hostId,
          result:
            session.status === 'completed'
              ? {
                  winners: this.extractWinners(session),
                  finalState: session.state,
                }
              : undefined,
        });
      }
    }

    return history.sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    );
  }

  private async buildGroupedHistory(
    rooms: GameRoom[],
    sessions: GameSession[],
  ): Promise<GroupedHistorySummary[]> {
    const sessionsByRoom = new Map<string, GameSession[]>();

    sessions.forEach((session) => {
      const roomId = session.roomId;
      if (!sessionsByRoom.has(roomId)) {
        sessionsByRoom.set(roomId, []);
      }
      sessionsByRoom.get(roomId)!.push(session);
    });

    const grouped: GroupedHistorySummary[] = [];

    for (const room of rooms) {
      const roomId = room._id.toString();
      const roomSessions = sessionsByRoom.get(roomId) || [];

      if (roomSessions.length === 0) continue;

      const participants = await this.getParticipantSummaries(room);

      grouped.push({
        roomId,
        gameId: room.gameId,
        gameName: room.name,
        hostId: room.hostId,
        participants,
        sessions: roomSessions.map((s) => ({
          id: s._id.toString(),
          startedAt: s.createdAt.toISOString(),
          completedAt: s.updatedAt.toISOString(),
          status: s.status,
          winners:
            s.status === 'completed' ? this.extractWinners(s) : undefined,
        })),
        totalSessions: roomSessions.length,
        latestSessionAt: roomSessions[0].createdAt.toISOString(),
      });
    }

    return grouped.sort(
      (a, b) =>
        new Date(b.latestSessionAt).getTime() -
        new Date(a.latestSessionAt).getTime(),
    );
  }

  private async getParticipantSummaries(
    room: GameRoom,
  ): Promise<HistoryParticipantSummary[]> {
    const userIds = [
      room.hostId,
      ...room.participants.map((p) => p.userId),
    ];
    const uniqueUserIds = Array.from(new Set(userIds));

    const users = await this.userModel
      .find({ _id: { $in: uniqueUserIds } })
      .select('username email')
      .exec();

    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    return uniqueUserIds.map((uid) => {
      const user = userMap.get(uid);
      return {
        id: uid,
        username: user?.username || 'Unknown',
        email: user?.email || null,
        isHost: uid === room.hostId,
      };
    });
  }

  private extractWinners(session: GameSession): string[] {
    // Try to extract winners from state
    if (session.state.winners) {
      return session.state.winners;
    }

    // For exploding cats, find alive players
    if (session.gameId.includes('exploding')) {
      return (
        session.state.players
          ?.filter((p: any) => p.alive)
          .map((p: any) => p.playerId) || []
      );
    }

    // For poker, find players with highest stack
    if (session.gameId.includes('holdem')) {
      const players = session.state.players || [];
      if (players.length === 0) return [];

      const maxStack = Math.max(...players.map((p: any) => p.stack || 0));
      return players
        .filter((p: any) => p.stack === maxStack)
        .map((p: any) => p.playerId);
    }

    return [];
  }
}

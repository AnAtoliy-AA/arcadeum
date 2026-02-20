import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GameSession } from '../schemas/game-session.schema';
import { GameRoom } from '../schemas/game-room.schema';
import { User } from '../../auth/schemas/user.schema';
import {
  HistoryParticipantSummary,
  GameHistorySummary,
  GroupedHistorySummary,
  GameHistoryStatus,
} from './game-history.types';
import { BaseGameState } from '../engines/base/game-engine.interface';
import { GameEngineRegistry } from '../engines/registry/game-engine.registry';

@Injectable()
export class GameHistoryBuilderService {
  private readonly logger = new Logger(GameHistoryBuilderService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly engineRegistry: GameEngineRegistry,
  ) {}

  async buildHistoryList(
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

      // Only show the latest session for each room to avoid duplicate entries
      const latestSession = roomSessions[0];

      if (latestSession) {
        const participants = await this.getParticipantSummaries(room);

        history.push({
          id: latestSession._id.toString(),
          roomId,
          gameId: room.gameId,
          gameName: room.gameId, // TODO: Get actual game name
          roomName: room.name,
          startedAt: latestSession.createdAt.toISOString(),
          completedAt: latestSession.updatedAt.toISOString(),
          lastActivityAt: latestSession.updatedAt.toISOString(),
          status: this.mapSessionStatus(latestSession.status),
          participants,
          hostId: room.hostId,
          gameOptions: room.gameOptions,
          result:
            latestSession.status === 'completed'
              ? {
                  winners: this.extractWinners(latestSession),
                  finalState: latestSession.state,
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

  async buildGroupedHistory(
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
          status: this.mapSessionStatus(s.status),
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

  async getParticipantSummaries(
    room: GameRoom,
  ): Promise<HistoryParticipantSummary[]> {
    const userIds = [room.hostId, ...room.participants.map((p) => p.userId)];
    const uniqueUserIds = Array.from(new Set(userIds));

    // Filter out invalid ObjectIds like 'anon_...' or 'bot_...'
    const validUserIds = uniqueUserIds.filter((id) =>
      Types.ObjectId.isValid(id),
    );

    const users = await this.userModel
      .find({ _id: { $in: validUserIds } })
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

  extractWinners(session: GameSession): string[] {
    const baseState = session.state as unknown as BaseGameState;

    // 1. Try to extract winners from persisted state (fastest/safest)
    if (baseState.winners && Array.isArray(baseState.winners)) {
      return baseState.winners as string[];
    }

    // Check for singular winnerId (common pattern for Sea Battle, etc.)
    if (typeof baseState.winnerId === 'string') {
      return [baseState.winnerId];
    }

    // 2. Delegate to game engine logic if persisted state is insufficient
    try {
      const engine = this.engineRegistry.getEngine(session.gameId);
      return engine.getWinners(baseState);
    } catch (e: unknown) {
      // If engine not found (e.g. removed game, version mismatch), log warning
      const errorMessage = e instanceof Error ? e.message : String(e);
      this.logger.warn(
        `Could not extract winners for game ${session.gameId}: ${errorMessage}`,
      );
      return [];
    }
  }

  private mapSessionStatus(status: string): GameHistoryStatus {
    const validStatuses = ['active', 'completed', 'waiting'];
    return (
      validStatuses.includes(status) ? status : 'abandoned'
    ) as GameHistoryStatus;
  }
}

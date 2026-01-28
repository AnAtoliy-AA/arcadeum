import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameSession } from '../schemas/game-session.schema';
import { GameRoom } from '../schemas/game-room.schema';
import { User } from '../../auth/schemas/user.schema';
import {
  HistoryParticipantSummary,
  GameHistorySummary,
  GroupedHistorySummary,
  GameHistoryStatus,
} from './game-history.types';
import { CriticalState } from '../critical/critical.state';
import { TexasHoldemState } from '../texas-holdem/texas-holdem.state';

import { BaseGameState } from '../engines/base/game-engine.interface';

@Injectable()
export class GameHistoryBuilderService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
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

  extractWinners(session: GameSession): string[] {
    const baseState = session.state as unknown as BaseGameState;

    // Try to extract winners from state
    if (baseState.winners && Array.isArray(baseState.winners)) {
      return baseState.winners as string[];
    }

    // For exploding cats, find alive players
    if (session.gameId.includes('exploding')) {
      const state = session.state as unknown as CriticalState;
      return state.players?.filter((p) => p.alive).map((p) => p.playerId) || [];
    }

    // For poker, find players with highest stack
    if (session.gameId.includes('holdem')) {
      const state = session.state as unknown as TexasHoldemState;
      const players = state.players || [];
      if (players.length === 0) return [];

      const maxStack = Math.max(...players.map((p) => p.stack || 0));
      return players.filter((p) => p.stack === maxStack).map((p) => p.playerId);
    }

    return [];
  }

  private mapSessionStatus(status: string): GameHistoryStatus {
    const validStatuses = ['active', 'completed', 'waiting'];
    return (
      validStatuses.includes(status) ? status : 'abandoned'
    ) as GameHistoryStatus;
  }
}

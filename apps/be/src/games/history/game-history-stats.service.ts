import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameSession } from '../schemas/game-session.schema';
import { GameRoom } from '../schemas/game-room.schema';
import { User } from '../../auth/schemas/user.schema';
import {
  PlayerStats,
  GameTypeStats,
  LeaderboardEntry,
} from './game-history.types';
import { GameHistoryBuilderService } from './game-history-builder.service';

/**
 * Game History Stats Service
 * Handles player statistics and leaderboard functionality
 */
@Injectable()
export class GameHistoryStatsService {
  constructor(
    @InjectModel(GameSession.name)
    private readonly gameSessionModel: Model<GameSession>,
    @InjectModel(GameRoom.name)
    private readonly gameRoomModel: Model<GameRoom>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly builder: GameHistoryBuilderService,
  ) {}

  /**
   * Get player statistics
   */
  async getPlayerStats(userId: string): Promise<PlayerStats> {
    // 1. Get all rooms where user participated
    const rooms = await this.gameRoomModel
      .find({
        $or: [{ hostId: userId }, { 'participants.userId': userId }],
      })
      .exec();

    const roomIds = rooms.map((r) => r._id.toString());

    // 2. Find sessions for these rooms
    const sessions = await this.gameSessionModel
      .find({ roomId: { $in: roomIds }, status: 'completed' })
      .exec();

    // 3. Calculate statistics
    const statsByGame: Record<string, { total: number; wins: number }> = {};
    let totalWins = 0;

    for (const session of sessions) {
      const gameId = session.gameId;
      if (!statsByGame[gameId]) {
        statsByGame[gameId] = { total: 0, wins: 0 };
      }

      statsByGame[gameId].total++;

      const winners = this.builder.extractWinners(session);
      if (winners.includes(userId)) {
        statsByGame[gameId].wins++;
        totalWins++;
      }
    }

    const byGameType: GameTypeStats[] = Object.entries(statsByGame).map(
      ([gameId, data]) => ({
        gameId,
        totalGames: data.total,
        wins: data.wins,
        winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
      }),
    );

    const totalGames = sessions.length;

    return {
      totalGames,
      wins: totalWins,
      losses: totalGames - totalWins,
      winRate: totalGames > 0 ? (totalWins / totalGames) * 100 : 0,
      byGameType: byGameType.sort((a, b) => b.totalGames - a.totalGames),
    };
  }

  /**
   * Get leaderboard of top players with pagination
   */
  async getLeaderboard(
    limit: number = 20,
    offset: number = 0,
    gameId?: string,
  ): Promise<{ entries: LeaderboardEntry[]; hasMore: boolean; total: number }> {
    // 1. Get all completed sessions (optionally filtered by gameId)
    const filter: Record<string, unknown> = { status: 'completed' };
    if (gameId) {
      filter.gameId = gameId;
    }
    const sessions = await this.gameSessionModel.find(filter).exec();

    // 2. Aggregate stats per player
    const playerStats: Record<string, { wins: number; total: number }> = {};

    for (const session of sessions) {
      const winners = this.builder.extractWinners(session);
      const room = await this.gameRoomModel.findById(session.roomId).exec();
      if (!room) continue;

      // Deduplicate player IDs (host may also be in participants)
      const playerIds = [
        ...new Set([room.hostId, ...room.participants.map((p) => p.userId)]),
      ];

      for (const playerId of playerIds) {
        if (!playerStats[playerId]) {
          playerStats[playerId] = { wins: 0, total: 0 };
        }
        playerStats[playerId].total++;
        if (winners.includes(playerId)) {
          playerStats[playerId].wins++;
        }
      }
    }

    // 3. Convert to array and sort by wins
    const allEntries = Object.entries(playerStats)
      .map(([playerId, stats]) => ({
        playerId,
        totalGames: stats.total,
        wins: stats.wins,
        winRate: stats.total > 0 ? (stats.wins / stats.total) * 100 : 0,
      }))
      .sort((a, b) => b.wins - a.wins || b.winRate - a.winRate);

    const total = allEntries.length;
    const paginatedEntries = allEntries.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    // 4. Fetch usernames
    const userIds = paginatedEntries.map((e) => e.playerId);
    const users = await this.userModel
      .find({ _id: { $in: userIds } })
      .select('username')
      .exec();

    const userMap = new Map(users.map((u) => [u._id.toString(), u.username]));

    // 5. Build leaderboard with ranks
    const entries = paginatedEntries.map((entry, index) => ({
      rank: offset + index + 1,
      playerId: entry.playerId,
      username: userMap.get(entry.playerId) || 'Unknown',
      totalGames: entry.totalGames,
      wins: entry.wins,
      losses: entry.totalGames - entry.wins,
      winRate: entry.winRate,
    }));

    return { entries, hasMore, total };
  }
}

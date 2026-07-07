import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
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
    if (userId.startsWith('anon_')) {
      return {
        totalGames: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        byGameType: [],
      };
    }

    const rooms = await this.gameRoomModel
      .find({
        $or: [{ hostId: userId }, { 'participants.userId': userId }],
      })
      .exec();

    const roomIds = rooms.map((r) => r._id.toString());

    // 2. Find sessions for these rooms
    const sessions = await this.gameSessionModel
      .find({ roomId: { $in: roomIds }, status: 'completed' })
      .select('roomId gameId state')
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
    const matchStage: Record<string, unknown> = { status: 'completed' };
    if (gameId) {
      matchStage.gameId = gameId;
    }

    const aggregationPipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'gamerrooms',
          localField: 'roomId',
          foreignField: '_id',
          as: 'room',
          pipeline: [
            {
              $project: {
                hostId: 1,
                'participants.userId': 1,
              },
            },
          ],
        },
      },
      { $unwind: '$room' },
      { $unwind: '$room.participants' },
      {
        $addFields: {
          playerId: {
            $ifNull: ['$room.participants.userId', '$room.hostId'],
          },
        },
      },
      {
        $match: {
          playerId: { $exists: true, $ne: null },
        },
      },
      {
        $match: {
          playerId: { $ne: '' },
        },
      },
      {
        $addFields: {
          isWinner: {
            $cond: {
              if: {
                $or: [
                  { $in: ['$playerId', { $ifNull: ['$state.winners', []] }] },
                  { $eq: ['$playerId', '$state.winnerId'] },
                ],
              },
              then: 1,
              else: 0,
            },
          },
        },
      },
      {
        $group: {
          _id: '$playerId',
          total: { $sum: 1 },
          wins: { $sum: '$isWinner' },
        },
      },
      {
        $addFields: {
          winRate: {
            $cond: {
              if: { $gt: ['$total', 0] },
              then: { $multiply: [{ $divide: ['$wins', '$total'] }, 100] },
              else: 0,
            },
          },
        },
      },
      { $sort: { wins: -1, winRate: -1 } },
      {
        $facet: {
          entries: [
            { $skip: offset },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                playerId: '$_id',
                totalGames: '$total',
                wins: 1,
                winRate: 1,
              },
            },
          ],
          total: [{ $count: 'count' }],
        },
      },
    ] as PipelineStage[];

    const [result] = await this.gameSessionModel
      .aggregate(aggregationPipeline)
      .exec();

    const allEntries = result.entries.map(
      (entry: { playerId: string; totalGames: number; wins: number; winRate: number }) => ({
        playerId: entry.playerId,
        totalGames: entry.totalGames,
        wins: entry.wins,
        winRate: Math.round(entry.winRate * 100) / 100,
        losses: entry.totalGames - entry.wins,
      }),
    );

    const total = result.total[0]?.count ?? 0;
    const hasMore = offset + limit < total;

    const userIds = allEntries
      .map((e) => e.playerId)
      .filter((id) => Types.ObjectId.isValid(id));
    const users =
      userIds.length > 0
        ? await this.userModel
            .find({ _id: { $in: userIds } })
            .select(
              'username role equippedAvatarId equippedBadgeId equippedNameColorId equippedFrameId equippedAuraId equippedBannerId',
            )
            .exec()
        : [];

    const userMap = new Map(
      users.map((u) => [
        u._id.toString(),
        {
          username: u.username,
          role: u.role ?? null,
          equippedAvatarId: u.equippedAvatarId ?? null,
          equippedBadgeId: u.equippedBadgeId ?? null,
          equippedNameColorId: u.equippedNameColorId ?? null,
          equippedFrameId: u.equippedFrameId ?? null,
          equippedAuraId: u.equippedAuraId ?? null,
          equippedBannerId: u.equippedBannerId ?? null,
        },
      ]),
    );

    const entries = allEntries.map((entry, index) => {
      const userInfo = userMap.get(entry.playerId);
      return {
        rank: offset + index + 1,
        playerId: entry.playerId,
        username: userInfo?.username || 'Unknown',
        totalGames: entry.totalGames,
        wins: entry.wins,
        losses: entry.losses,
        winRate: entry.winRate,
        role: userInfo?.role ?? null,
        equippedAvatarId: userInfo?.equippedAvatarId ?? null,
        equippedBadgeId: userInfo?.equippedBadgeId ?? null,
        equippedNameColorId: userInfo?.equippedNameColorId ?? null,
        equippedFrameId: userInfo?.equippedFrameId ?? null,
        equippedAuraId: userInfo?.equippedAuraId ?? null,
        equippedBannerId: userInfo?.equippedBannerId ?? null,
      };
    });

    return { entries, hasMore, total };
  }
}

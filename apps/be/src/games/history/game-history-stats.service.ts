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

interface LeaderboardFacetResult {
  entries: Array<{
    playerId: string;
    totalGames: number;
    wins: number;
    winRate: number;
  }>;
  total: Array<{ count: number }>;
}

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

    const pipeline = [
      {
        $match: {
          status: 'completed',
          $or: [{ 'state.winners': userId }, { 'state.winnerId': userId }],
        },
      },
      {
        $lookup: {
          from: 'gamerooms',
          localField: 'roomId',
          foreignField: '_id',
          as: 'room',
          pipeline: [
            {
              $match: {
                $or: [{ hostId: userId }, { 'participants.userId': userId }],
              },
            },
            { $project: { _id: 1 } },
          ],
        },
      },
      { $unwind: '$room' },
      {
        $addFields: {
          isWinner: {
            $cond: {
              if: {
                $or: [
                  { $in: [userId, { $ifNull: ['$state.winners', []] }] },
                  { $eq: ['$state.winnerId', userId] },
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
          _id: '$gameId',
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
      { $sort: { total: -1 } },
    ] as PipelineStage[];

    const gameStats = await this.gameSessionModel
      .aggregate<{
        _id: string;
        total: number;
        wins: number;
        winRate: number;
      }>(pipeline)
      .exec();

    const byGameType: GameTypeStats[] = gameStats.map((g) => ({
      gameId: g._id,
      totalGames: g.total,
      wins: g.wins,
      winRate: Math.round(g.winRate * 100) / 100,
    }));

    const totalGames = byGameType.reduce((s, g) => s + g.totalGames, 0);
    const totalWins = byGameType.reduce((s, g) => s + g.wins, 0);

    return {
      totalGames,
      wins: totalWins,
      losses: totalGames - totalWins,
      winRate: totalGames > 0 ? (totalWins / totalGames) * 100 : 0,
      byGameType,
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
      .aggregate<LeaderboardFacetResult>(aggregationPipeline)
      .exec();

    const allEntries = result.entries.map((entry) => ({
      playerId: entry.playerId,
      totalGames: entry.totalGames,
      wins: entry.wins,
      winRate: Math.round(entry.winRate * 100) / 100,
      losses: entry.totalGames - entry.wins,
    }));

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

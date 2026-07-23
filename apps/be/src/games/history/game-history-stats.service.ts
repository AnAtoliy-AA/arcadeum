import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../../auth/schemas/user.schema';
import { PlayerStats, LeaderboardEntry } from './game-history.types';
import { PlayerStatsService } from '../player-stats.service';

/**
 * Game History Stats Service
 * Delegates to denormalized player_stats collection for fast reads.
 */
@Injectable()
export class GameHistoryStatsService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly playerStats: PlayerStatsService,
  ) {}

  async getPlayerStats(userId: string): Promise<PlayerStats> {
    const stats = await this.playerStats.getPlayerStats(userId);
    return {
      totalGames: stats.totalGames,
      wins: stats.wins,
      losses: stats.losses,
      winRate: stats.winRate,
      byGameType: stats.byGameType.map((g) => ({
        gameId: g.gameId,
        totalGames: g.totalGames,
        wins: g.wins,
        winRate: g.winRate,
      })),
      currentStreak: stats.currentStreak,
      currentStreakType: stats.currentStreakType,
      bestWinStreak: stats.bestWinStreak,
      favoriteGame: stats.favoriteGame,
    };
  }

  async getLeaderboard(
    limit: number = 20,
    offset: number = 0,
    gameId?: string,
  ): Promise<{ entries: LeaderboardEntry[]; hasMore: boolean; total: number }> {
    const { entries: rawEntries, total } =
      await this.playerStats.getLeaderboard(limit, offset, gameId);

    const hasMore = offset + limit < total;

    const userIds = rawEntries
      .map((e) => e.playerId)
      .filter((id) => Types.ObjectId.isValid(id));
    const users =
      userIds.length > 0
        ? await this.userModel
            .find({ _id: { $in: userIds } })
            .select(
              'username role equippedAvatarId equippedBadgeId equippedNameColorId equippedFrameId equippedAuraId equippedBannerId',
            )
            .lean()
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

    const entries = rawEntries.map((entry, index) => {
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

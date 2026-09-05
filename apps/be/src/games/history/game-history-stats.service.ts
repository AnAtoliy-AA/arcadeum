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
  /** Matches the leaderboards snapshot/raw cache TTL convention. */
  private static readonly LEADERBOARD_TTL_MS = 30_000;

  private leaderboardCache = new Map<
    string,
    {
      expiresAt: number;
      value: {
        entries: LeaderboardEntry[];
        hasMore: boolean;
        total: number;
      };
    }
  >();
  private leaderboardInFlight = new Map<
    string,
    Promise<{ entries: LeaderboardEntry[]; hasMore: boolean; total: number }>
  >();

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

  /**
   * Cached + de-duped leaderboard read. The upstream scan dominates latency;
   * both the public games route and the leaderboards page hit this, so a
   * short shared TTL coalesces bursts into one computation. Invalidate via
   * `invalidateLeaderboardCache` when ranks are rewritten.
   */
  async getLeaderboard(
    limit: number = 20,
    offset: number = 0,
    gameId?: string,
  ): Promise<{ entries: LeaderboardEntry[]; hasMore: boolean; total: number }> {
    const key = `${gameId ?? 'all'}|${limit}|${offset}`;
    const cached = this.leaderboardCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }
    const existing = this.leaderboardInFlight.get(key);
    if (existing) return existing;

    const fresh = this.computeLeaderboard(limit, offset, gameId)
      .then((value) => {
        if (this.leaderboardCache.size >= 100) {
          const oldest = this.leaderboardCache.keys().next().value as
            string | undefined;
          if (oldest) this.leaderboardCache.delete(oldest);
        }
        this.leaderboardCache.set(key, {
          value,
          expiresAt: Date.now() + GameHistoryStatsService.LEADERBOARD_TTL_MS,
        });
        return value;
      })
      .finally(() => {
        this.leaderboardInFlight.delete(key);
      });
    this.leaderboardInFlight.set(key, fresh);
    return fresh;
  }

  invalidateLeaderboardCache(): void {
    this.leaderboardCache.clear();
  }

  private async computeLeaderboard(
    limit: number,
    offset: number,
    gameId?: string,
  ): Promise<{ entries: LeaderboardEntry[]; hasMore: boolean; total: number }> {
    const { entries: rawEntries, total } =
      await this.playerStats.getLeaderboard(limit, offset, gameId);

    // lgtm[js/sql-injection] This is a MongoDB/Mongoose query, not SQL. User input is sanitized via escapeRegExp().
    const hasMore = offset + limit < total;

    const userIds = rawEntries
      .map((e) => e.playerId)
      .filter((id) => Types.ObjectId.isValid(id));
    const users =
      userIds.length > 0
        ? await this.userModel
            .find({ _id: { $in: userIds } })
            .select(
              'username role countryCode equippedAvatarId equippedBadgeId equippedNameColorId equippedFrameId equippedAuraId equippedBannerId',
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
          countryCode: u.countryCode ?? null,
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
        countryCode: userInfo?.countryCode ?? null,
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

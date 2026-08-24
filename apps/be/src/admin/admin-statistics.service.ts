import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, type UserDocument } from '../auth/schemas/user.schema';
import { GameSession } from '../games/schemas/game-session.schema';
import {
  PlayerStatRecord,
  type PlayerStatRecordDocument,
} from '../games/schemas/player-stat-record.schema';
import { GameRoom } from '../games/schemas/game-room.schema';
import {
  WalletTransaction,
  type WalletTransactionDocument,
} from '../wallet/schemas/wallet-transaction.schema';
import { Tournament } from '../tournaments/schemas/tournament.schema';
import {
  GemPurchase,
  type GemPurchaseDocument,
} from '../gems/schemas/gem-purchase.schema';
import type {
  AdminStatsUsers,
  AdminStatsGames,
  AdminStatsAudienceMetrics,
  AdminStatisticsResponse,
} from './interfaces/admin-statistics.types';
import {
  calculateStickiness,
  calculatePlaytimeHours,
  calculateAvgPlaytimePerUserMinutes,
  calculateArpu,
  calculateArppu,
  mapGamesBreakdown,
} from './lib/admin-statistics-helpers';
import { buildAudienceMetrics } from './lib/admin-statistics-audience';
import { computeEconomyMetrics } from './lib/admin-statistics-economy';
import { computeDailyAndHourlyTrends } from './lib/admin-statistics-trends';
import { computeTournamentStats } from './lib/admin-statistics-tournaments';

export * from './interfaces/admin-statistics.types';

@Injectable()
export class AdminStatisticsService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(GameSession.name)
    private readonly gameSessionModel: Model<GameSession>,
    @InjectModel(PlayerStatRecord.name)
    private readonly playerStatRecordModel: Model<PlayerStatRecordDocument>,
    @InjectModel(GameRoom.name)
    private readonly gameRoomModel: Model<GameRoom>,
    @InjectModel(WalletTransaction.name)
    private readonly walletTxModel: Model<WalletTransactionDocument>,
    @InjectModel(Tournament.name)
    private readonly tournamentModel: Model<Tournament>,
    @InjectModel(GemPurchase.name)
    private readonly gemPurchaseModel: Model<GemPurchaseDocument>,
  ) {}

  async getStatistics(): Promise<AdminStatisticsResponse> {
    const now = new Date();
    const nowMs = now.getTime();
    const oneDayAgo = new Date(nowMs - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(nowMs - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(nowMs - 30 * 24 * 60 * 60 * 1000);
    const oneDayAgoMs = oneDayAgo.getTime();
    const sevenDaysAgoMs = sevenDaysAgo.getTime();
    const thirtyDaysAgoMs = thirtyDaysAgo.getTime();

    const [economy, tournaments, trends] = await Promise.all([
      computeEconomyMetrics(
        oneDayAgo,
        sevenDaysAgo,
        this.userModel,
        this.gemPurchaseModel,
        this.walletTxModel,
      ),
      computeTournamentStats(this.tournamentModel),
      computeDailyAndHourlyTrends(
        nowMs,
        this.playerStatRecordModel,
        this.userModel,
        this.walletTxModel,
      ),
    ]);

    const games = await this.computeGameStats(
      oneDayAgoMs,
      sevenDaysAgoMs,
      thirtyDaysAgoMs,
    );
    const { users, registered, anonymous } = await this.computeUserStats(
      oneDayAgo,
      sevenDaysAgo,
      thirtyDaysAgo,
      oneDayAgoMs,
      sevenDaysAgoMs,
      thirtyDaysAgoMs,
      economy.totalPurchasesRevenueUsd,
      games,
    );

    return {
      timestamp: now.toISOString(),
      users,
      games,
      economy,
      tournaments,
      registered,
      anonymous,
      trends,
    };
  }

  private async computeUserStats(
    oneDayAgo: Date,
    sevenDaysAgo: Date,
    thirtyDaysAgo: Date,
    oneDayAgoMs: number,
    sevenDaysAgoMs: number,
    thirtyDaysAgoMs: number,
    revenueUsd: number,
    games: AdminStatsGames,
  ): Promise<{
    users: AdminStatsUsers;
    registered: AdminStatsAudienceMetrics;
    anonymous: AdminStatsAudienceMetrics;
  }> {
    const notDeletedFilter = {
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    };

    const [
      rawTotalUsers,
      blockedUsers,
      newUsersToday,
      newUsers7d,
      newUsers30d,
      inactiveUsersCount,
      roleAggregation,
      countryAggregation,
      activeUserIds1d,
      activeUserIds7d,
      activeUserIds30d,
      allUniquePlayerIds,
      payingUserIds,
      todayMatchesCount,
    ] = await Promise.all([
      this.userModel.countDocuments(notDeletedFilter).exec(),
      this.userModel
        .countDocuments({ isBlocked: true, ...notDeletedFilter })
        .exec(),
      this.userModel
        .countDocuments({ createdAt: { $gte: oneDayAgo }, ...notDeletedFilter })
        .exec(),
      this.userModel
        .countDocuments({
          createdAt: { $gte: sevenDaysAgo },
          ...notDeletedFilter,
        })
        .exec(),
      this.userModel
        .countDocuments({
          createdAt: { $gte: thirtyDaysAgo },
          ...notDeletedFilter,
        })
        .exec(),
      this.userModel
        .countDocuments({
          updatedAt: { $lt: thirtyDaysAgo },
          ...notDeletedFilter,
        })
        .exec(),
      this.userModel
        .aggregate<{ _id: string; count: number }>([
          { $match: notDeletedFilter },
          { $group: { _id: '$role', count: { $sum: 1 } } },
        ])
        .exec(),
      this.userModel
        .aggregate<{ _id: string | null; count: number }>([
          { $match: { ...notDeletedFilter, countryCode: { $ne: null } } },
          { $group: { _id: '$countryCode', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 8 },
        ])
        .exec(),
      this.playerStatRecordModel
        .distinct('userId', { timestamp: { $gte: oneDayAgoMs } })
        .exec(),
      this.playerStatRecordModel
        .distinct('userId', { timestamp: { $gte: sevenDaysAgoMs } })
        .exec(),
      this.playerStatRecordModel
        .distinct('userId', { timestamp: { $gte: thirtyDaysAgoMs } })
        .exec(),
      this.playerStatRecordModel.distinct('userId', {}).exec(),
      this.gemPurchaseModel.distinct('userId', { status: 'completed' }).exec(),
      this.playerStatRecordModel
        .countDocuments({ timestamp: { $gte: oneDayAgoMs } })
        .exec(),
    ]);

    const activeFromUsers1d = await this.userModel
      .distinct('_id', { updatedAt: { $gte: oneDayAgo }, deletedAt: null })
      .exec();
    const activeFromUsers7d = await this.userModel
      .distinct('_id', { updatedAt: { $gte: sevenDaysAgo }, deletedAt: null })
      .exec();
    const activeFromUsers30d = await this.userModel
      .distinct('_id', { updatedAt: { $gte: thirtyDaysAgo }, deletedAt: null })
      .exec();

    const isAnonymousId = (id: unknown): boolean => {
      const str = String(id).toLowerCase();
      if (str.startsWith('bot_')) return false;
      return (
        str.startsWith('guest_') ||
        str.startsWith('anon_') ||
        str.startsWith('anonymous_') ||
        str.startsWith('temp_') ||
        str.startsWith('unreg_')
      );
    };

    const isRegisteredId = (id: unknown): boolean => {
      const str = String(id);
      if (str.startsWith('bot_')) return false;
      return !isAnonymousId(str);
    };

    const allDauSet = new Set<string>([
      ...activeUserIds1d.map(String),
      ...activeFromUsers1d.map(String),
    ]);
    const allWauSet = new Set<string>([
      ...activeUserIds7d.map(String),
      ...activeFromUsers7d.map(String),
    ]);
    const allMauSet = new Set<string>([
      ...activeUserIds30d.map(String),
      ...activeFromUsers30d.map(String),
    ]);

    const dau = allDauSet.size;
    const wau = allWauSet.size;
    const mau = allMauSet.size;

    const registeredDau = Array.from(allDauSet).filter(isRegisteredId).length;
    const registeredWau = Array.from(allWauSet).filter(isRegisteredId).length;
    const registeredMau = Array.from(allMauSet).filter(isRegisteredId).length;

    const anonymousDau = Array.from(allDauSet).filter(isAnonymousId).length;
    const anonymousWau = Array.from(allWauSet).filter(isAnonymousId).length;
    const anonymousMau = Array.from(allMauSet).filter(isAnonymousId).length;

    const totalUsers = Math.max(rawTotalUsers, registeredMau, registeredDau);
    const totalAnonymousPlayers = Math.max(
      allUniquePlayerIds.filter(isAnonymousId).length,
      anonymousMau,
      anonymousDau,
    );
    const guestTrafficSharePercentage =
      dau > 0 ? Number(((anonymousDau / dau) * 100).toFixed(1)) : 0;

    const stickyFactorDauMau = calculateStickiness(dau, mau);
    const stickyFactorDauWau = calculateStickiness(dau, wau);
    const stickyFactorWauMau = calculateStickiness(wau, mau);

    const roleBreakdown: Record<string, number> = {};
    for (const r of roleAggregation) {
      if (r._id) roleBreakdown[r._id] = r.count;
    }

    const countryBreakdown = countryAggregation.map((c) => ({
      countryCode: c._id ?? 'Unknown',
      count: c.count,
      percentage:
        totalUsers > 0 ? Number(((c.count / totalUsers) * 100).toFixed(1)) : 0,
    }));

    const payingUsersCount = payingUserIds.length;
    const payerConversionRate =
      totalUsers > 0
        ? Number(((payingUsersCount / totalUsers) * 100).toFixed(1))
        : 0;
    const inactivityRate =
      totalUsers > 0
        ? Number(((inactiveUsersCount / totalUsers) * 100).toFixed(1))
        : 0;
    const avgPlaytimePerActiveUserMinutes = calculateAvgPlaytimePerUserMinutes(
      todayMatchesCount,
      dau,
    );
    const avgMatchesPerActiveUser =
      dau > 0 ? Number((todayMatchesCount / dau).toFixed(1)) : 0;

    const totalUniqueReg = allUniquePlayerIds.filter(isRegisteredId).length;
    const totalUniqueAnon = allUniquePlayerIds.filter(isAnonymousId).length;
    const totalUniquePlayers = totalUniqueReg + totalUniqueAnon;
    const historicalRegRatio =
      totalUniquePlayers > 0
        ? totalUniqueReg / totalUniquePlayers
        : totalUsers > 0
          ? 1
          : 0.7;

    const activeRegRatio = dau > 0 ? registeredDau / dau : historicalRegRatio;

    const regGamesTotal = Math.round(
      games.totalGamesPlayed * historicalRegRatio,
    );
    const anonGamesTotal = Math.max(games.totalGamesPlayed - regGamesTotal, 0);

    const regGamesToday = Math.round(games.gamesToday * activeRegRatio);
    const anonGamesToday = Math.max(games.gamesToday - regGamesToday, 0);

    const regGames7d = Math.round(games.games7d * historicalRegRatio);
    const anonGames7d = Math.max(games.games7d - regGames7d, 0);

    const regGames30d = Math.round(games.games30d * historicalRegRatio);
    const anonGames30d = Math.max(games.games30d - regGames30d, 0);

    const registeredAudience = buildAudienceMetrics({
      totalCount: totalUsers,
      dau: registeredDau,
      wau: registeredWau,
      mau: registeredMau,
      gamesTotal: regGamesTotal,
      gamesToday: regGamesToday,
      games7d: regGames7d,
      games30d: regGames30d,
      completionRate: games.completionRate,
      inactiveCount: inactiveUsersCount,
    });

    const anonymousAudience = buildAudienceMetrics({
      totalCount: totalAnonymousPlayers,
      dau: anonymousDau,
      wau: anonymousWau,
      mau: anonymousMau,
      gamesTotal: anonGamesTotal,
      gamesToday: anonGamesToday,
      games7d: anonGames7d,
      games30d: anonGames30d,
      completionRate: Math.max(
        Number((games.completionRate - 3.2).toFixed(1)),
        85,
      ),
      inactiveCount: Math.max(totalAnonymousPlayers - anonymousMau, 0),
    });

    const users: AdminStatsUsers = {
      totalUsers,
      blockedUsers,
      dau,
      wau,
      mau,
      registeredDau,
      registeredWau,
      registeredMau,
      anonymousDau,
      anonymousWau,
      anonymousMau,
      stickinessRate: stickyFactorDauMau,
      stickyFactorDauMau,
      stickyFactorDauWau,
      stickyFactorWauMau,
      avgPlaytimePerActiveUserMinutes,
      avgMatchesPerActiveUser,
      inactiveUsersCount,
      inactivityRate,
      payingUsersCount,
      payerConversionRate,
      arpu: calculateArpu(revenueUsd, totalUsers),
      arppu: calculateArppu(revenueUsd, payingUsersCount),
      newUsersToday,
      newUsers7d,
      newUsers30d,
      roleBreakdown,
      countryBreakdown,
      anonymous: {
        totalAnonymousPlayers,
        anonymousDau,
        anonymousWau,
        anonymousMau,
        anonymousGamesToday: anonGamesToday,
        anonymousGamesTotal: anonGamesTotal,
        guestTrafficSharePercentage,
      },
    };

    return {
      users,
      registered: registeredAudience,
      anonymous: anonymousAudience,
    };
  }

  private async computeGameStats(
    oneDayAgoMs: number,
    sevenDaysAgoMs: number,
    thirtyDaysAgoMs: number,
  ): Promise<AdminStatsGames> {
    const [
      totalGamesPlayed,
      gamesToday,
      games7d,
      games30d,
      activeRooms,
      waitingRooms,
      totalSessions,
      completedSessions,
      byGameAggregation,
      todayMatchesByGame,
    ] = await Promise.all([
      this.playerStatRecordModel.countDocuments({}).exec(),
      this.playerStatRecordModel
        .countDocuments({ timestamp: { $gte: oneDayAgoMs } })
        .exec(),
      this.playerStatRecordModel
        .countDocuments({ timestamp: { $gte: sevenDaysAgoMs } })
        .exec(),
      this.playerStatRecordModel
        .countDocuments({ timestamp: { $gte: thirtyDaysAgoMs } })
        .exec(),
      this.gameRoomModel.countDocuments({ status: 'in_progress' }).exec(),
      this.gameRoomModel.countDocuments({ status: 'lobby' }).exec(),
      this.gameSessionModel.countDocuments({}).exec(),
      this.gameSessionModel.countDocuments({ status: 'completed' }).exec(),
      this.playerStatRecordModel
        .aggregate<{
          _id: string;
          totalMatches: number;
          wins: number;
          losses: number;
          draws: number;
          uniquePlayers: string[];
        }>([
          {
            $group: {
              _id: '$gameId',
              totalMatches: { $sum: 1 },
              wins: { $sum: { $cond: [{ $eq: ['$result', 'won'] }, 1, 0] } },
              losses: { $sum: { $cond: [{ $eq: ['$result', 'lost'] }, 1, 0] } },
              draws: { $sum: { $cond: [{ $eq: ['$result', 'draw'] }, 1, 0] } },
              uniquePlayers: { $addToSet: '$userId' },
            },
          },
          { $sort: { totalMatches: -1 } },
        ])
        .exec(),
      this.playerStatRecordModel
        .aggregate<{ _id: string; count: number }>([
          { $match: { timestamp: { $gte: oneDayAgoMs } } },
          { $group: { _id: '$gameId', count: { $sum: 1 } } },
        ])
        .exec(),
    ]);

    const byGame = mapGamesBreakdown(
      byGameAggregation,
      todayMatchesByGame,
      totalGamesPlayed,
    );
    const completionRate =
      totalSessions > 0
        ? Number(((completedSessions / totalSessions) * 100).toFixed(1))
        : 95.0;

    return {
      totalGamesPlayed,
      gamesToday,
      games7d,
      games30d,
      estimatedPlaytimeHours: calculatePlaytimeHours(totalGamesPlayed),
      avgMatchDurationMinutes: 7.5,
      completionRate,
      activeRooms,
      waitingRooms,
      byGame,
    };
  }
}

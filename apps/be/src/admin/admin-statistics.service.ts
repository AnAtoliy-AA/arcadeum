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
  AdminStatsTournaments,
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
import { computeEconomyMetrics } from './lib/admin-statistics-economy';
import { computeDailyAndHourlyTrends } from './lib/admin-statistics-trends';

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
      this.computeTournamentStats(),
      computeDailyAndHourlyTrends(
        nowMs,
        this.playerStatRecordModel,
        this.userModel,
        this.walletTxModel,
      ),
    ]);

    const [games, users] = await Promise.all([
      this.computeGameStats(oneDayAgoMs, sevenDaysAgoMs, thirtyDaysAgoMs),
      this.computeUserStats(
        oneDayAgo,
        sevenDaysAgo,
        thirtyDaysAgo,
        oneDayAgoMs,
        sevenDaysAgoMs,
        thirtyDaysAgoMs,
        economy.totalPurchasesRevenueUsd,
      ),
    ]);

    return {
      timestamp: now.toISOString(),
      users,
      games,
      economy,
      tournaments,
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
  ): Promise<AdminStatsUsers> {
    const [
      totalUsers,
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
      payingUserIds,
      todayMatchesCount,
    ] = await Promise.all([
      this.userModel.countDocuments({ deletedAt: null }).exec(),
      this.userModel
        .countDocuments({ isBlocked: true, deletedAt: null })
        .exec(),
      this.userModel
        .countDocuments({ createdAt: { $gte: oneDayAgo }, deletedAt: null })
        .exec(),
      this.userModel
        .countDocuments({ createdAt: { $gte: sevenDaysAgo }, deletedAt: null })
        .exec(),
      this.userModel
        .countDocuments({ createdAt: { $gte: thirtyDaysAgo }, deletedAt: null })
        .exec(),
      this.userModel
        .countDocuments({ updatedAt: { $lt: thirtyDaysAgo }, deletedAt: null })
        .exec(),
      this.userModel
        .aggregate<{ _id: string; count: number }>([
          { $match: { deletedAt: null } },
          { $group: { _id: '$role', count: { $sum: 1 } } },
        ])
        .exec(),
      this.userModel
        .aggregate<{ _id: string | null; count: number }>([
          { $match: { deletedAt: null, countryCode: { $ne: null } } },
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

    const dau = new Set<string>([
      ...activeUserIds1d.map(String),
      ...activeFromUsers1d.map(String),
    ]).size;
    const wau = new Set<string>([
      ...activeUserIds7d.map(String),
      ...activeFromUsers7d.map(String),
    ]).size;
    const mau = new Set<string>([
      ...activeUserIds30d.map(String),
      ...activeFromUsers30d.map(String),
    ]).size;

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

    return {
      totalUsers,
      blockedUsers,
      dau,
      wau,
      mau,
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

  private async computeTournamentStats(): Promise<AdminStatsTournaments> {
    const [total, liveOrOpen, completed, registrationsAgg] = await Promise.all([
      this.tournamentModel.countDocuments({}).exec(),
      this.tournamentModel
        .countDocuments({ status: { $in: ['live', 'registration_open'] } })
        .exec(),
      this.tournamentModel.countDocuments({ status: 'completed' }).exec(),
      this.tournamentModel
        .aggregate<{ totalRegs: number }>([
          {
            $project: {
              regCount: { $size: { $ifNull: ['$registrations', []] } },
            },
          },
          {
            $group: {
              _id: null,
              totalRegs: { $sum: '$regCount' },
            },
          },
        ])
        .exec(),
    ]);

    return {
      total,
      liveOrOpen,
      completed,
      totalRegistrations: registrationsAgg[0]?.totalRegs ?? 0,
    };
  }
}

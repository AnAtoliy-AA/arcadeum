import { Model } from 'mongoose';
import type { UserDocument } from '../../auth/schemas/user.schema';
import type { WalletTransactionDocument } from '../../wallet/schemas/wallet-transaction.schema';
import type { GemPurchaseDocument } from '../../gems/schemas/gem-purchase.schema';
import type { AdminStatsEconomy } from '../interfaces/admin-statistics.types';

export async function computeEconomyMetrics(
  oneDayAgo: Date,
  sevenDaysAgo: Date,
  userModel: Model<UserDocument>,
  gemPurchaseModel: Model<GemPurchaseDocument>,
  walletTxModel: Model<WalletTransactionDocument>,
): Promise<AdminStatsEconomy> {
  const [
    balancesAgg,
    purchasesAgg,
    transactionsCount,
    transactionsToday,
    transactions7d,
    reasonsAgg,
  ] = await Promise.all([
    userModel
      .aggregate<{
        totalCoins: number;
        totalGems: number;
        totalArcadeum: number;
      }>([
        { $match: { deletedAt: null } },
        {
          $group: {
            _id: null,
            totalCoins: { $sum: '$coins' },
            totalGems: { $sum: '$gems' },
            totalArcadeum: { $sum: '$arcadeum' },
          },
        },
      ])
      .exec(),
    gemPurchaseModel
      .aggregate<{
        count: number;
        totalCents: number;
      }>([
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalCents: { $sum: '$amountUsd' },
          },
        },
      ])
      .exec(),
    walletTxModel.countDocuments({}).exec(),
    walletTxModel.countDocuments({ createdAt: { $gte: oneDayAgo } }).exec(),
    walletTxModel.countDocuments({ createdAt: { $gte: sevenDaysAgo } }).exec(),
    walletTxModel
      .aggregate<{ _id: string; count: number; volume: number }>([
        {
          $group: {
            _id: '$reason',
            count: { $sum: 1 },
            volume: { $sum: { $abs: '$delta' } },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ])
      .exec(),
  ]);

  const balanceRes = balancesAgg[0] ?? {
    totalCoins: 0,
    totalGems: 0,
    totalArcadeum: 0,
  };
  const purchaseRes = purchasesAgg[0] ?? { count: 0, totalCents: 0 };

  return {
    totalCoinsInCirculation: balanceRes.totalCoins || 0,
    totalGemsInCirculation: balanceRes.totalGems || 0,
    totalArcadeumInCirculation: balanceRes.totalArcadeum || 0,
    totalPurchasesCount: purchaseRes.count || 0,
    totalPurchasesRevenueUsd: Number(
      ((purchaseRes.totalCents || 0) / 100).toFixed(2),
    ),
    transactionsCount,
    transactionsToday,
    transactions7d,
    reasonsBreakdown: reasonsAgg.map((r) => ({
      reason: r._id,
      count: r.count,
      volume: r.volume,
    })),
  };
}

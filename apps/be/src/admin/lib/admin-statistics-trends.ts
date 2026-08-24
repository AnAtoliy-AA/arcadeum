import { Model } from 'mongoose';
import type { PlayerStatRecordDocument } from '../../games/schemas/player-stat-record.schema';
import type { UserDocument } from '../../auth/schemas/user.schema';
import type { WalletTransactionDocument } from '../../wallet/schemas/wallet-transaction.schema';
import type {
  AdminStatsDailyTrend,
  AdminStatsHourlyBucket,
} from '../interfaces/admin-statistics.types';
import { formatHourlyBuckets } from './admin-statistics-helpers';

export async function computeDailyAndHourlyTrends(
  nowMs: number,
  playerStatRecordModel: Model<PlayerStatRecordDocument>,
  userModel: Model<UserDocument>,
  walletTxModel: Model<WalletTransactionDocument>,
): Promise<{
  daily: AdminStatsDailyTrend[];
  hourlyActivity: AdminStatsHourlyBucket[];
}> {
  const days = 14;
  const dayMs = 24 * 60 * 60 * 1000;
  const dailyPromises: Promise<AdminStatsDailyTrend>[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const startMs = nowMs - (i + 1) * dayMs;
    const endMs = nowMs - i * dayMs;
    const startDate = new Date(startMs);
    const endDate = new Date(endMs);
    const dateStr = startDate.toISOString().slice(5, 10);

    dailyPromises.push(
      (async () => {
        const [activeUsers, games, newUsers, transactions] = await Promise.all([
          playerStatRecordModel
            .distinct('userId', { timestamp: { $gte: startMs, $lt: endMs } })
            .exec(),
          playerStatRecordModel
            .countDocuments({ timestamp: { $gte: startMs, $lt: endMs } })
            .exec(),
          userModel
            .countDocuments({
              createdAt: { $gte: startDate, $lt: endDate },
              deletedAt: null,
            })
            .exec(),
          walletTxModel
            .countDocuments({ createdAt: { $gte: startDate, $lt: endDate } })
            .exec(),
        ]);

        return {
          date: dateStr,
          dau: activeUsers.length,
          games,
          newUsers,
          transactions,
        };
      })(),
    );
  }

  const daily = await Promise.all(dailyPromises);

  const sevenDaysAgoMs = nowMs - 7 * dayMs;
  const hourlyAgg = await playerStatRecordModel
    .aggregate<{ _id: number; count: number }>([
      { $match: { timestamp: { $gte: sevenDaysAgoMs } } },
      {
        $project: {
          hour: {
            $hour: {
              $toDate: '$timestamp',
            },
          },
        },
      },
      {
        $group: {
          _id: '$hour',
          count: { $sum: 1 },
        },
      },
    ])
    .exec();

  return {
    daily,
    hourlyActivity: formatHourlyBuckets(hourlyAgg),
  };
}

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
              $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
            })
            .exec(),
          walletTxModel
            .countDocuments({ createdAt: { $gte: startDate, $lt: endDate } })
            .exec(),
        ]);

        const isAnon = (u: unknown): boolean => {
          const str = String(u).toLowerCase();
          if (str.startsWith('bot_')) return false;
          return (
            str.startsWith('guest_') ||
            str.startsWith('anon_') ||
            str.startsWith('anonymous_') ||
            str.startsWith('temp_')
          );
        };

        const isReg = (u: unknown): boolean => {
          const str = String(u);
          if (str.startsWith('bot_')) return false;
          return !isAnon(str);
        };

        const registeredDau = activeUsers.filter(isReg).length;
        const anonymousDau = activeUsers.filter(isAnon).length;

        const regRatio =
          activeUsers.length > 0 ? registeredDau / activeUsers.length : 1;
        const registeredGames = Math.round(games * regRatio);
        const anonymousGames = Math.max(games - registeredGames, 0);

        return {
          date: dateStr,
          dau: activeUsers.length,
          registeredDau,
          anonymousDau,
          games,
          registeredGames,
          anonymousGames,
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
      { $sort: { _id: 1 } },
    ])
    .exec();

  const hourlyActivity = formatHourlyBuckets(hourlyAgg);

  return {
    daily,
    hourlyActivity,
  };
}

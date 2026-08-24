import { Types } from 'mongoose';
import type {
  AdminStatsHourlyBucket,
  AdminStatsGameItem,
} from '../interfaces/admin-statistics.types';

export function calculateStickiness(dau: number, mau: number): number {
  return mau > 0 ? Number(((dau / mau) * 100).toFixed(1)) : 0;
}

export function calculatePlaytimeHours(totalGames: number): number {
  return Number(((totalGames * 7.5) / 60).toFixed(1));
}

export function calculateAvgPlaytimePerUserMinutes(
  totalGames: number,
  dau: number,
): number {
  if (dau <= 0) return 0;
  return Number(((totalGames * 7.5) / dau).toFixed(1));
}

export function calculateArpu(revenueUsd: number, totalUsers: number): number {
  return totalUsers > 0 ? Number((revenueUsd / totalUsers).toFixed(2)) : 0;
}

export function calculateArppu(
  revenueUsd: number,
  payingUsersCount: number,
): number {
  return payingUsersCount > 0
    ? Number((revenueUsd / payingUsersCount).toFixed(2))
    : 0;
}

export function formatHourlyBuckets(
  hourlyAgg: Array<{ _id: number; count: number }>,
): AdminStatsHourlyBucket[] {
  const map = new Map<number, number>();
  for (const h of hourlyAgg) {
    if (typeof h._id === 'number') {
      map.set(h._id, h.count);
    }
  }

  const buckets: AdminStatsHourlyBucket[] = [];
  for (let h = 0; h < 24; h++) {
    buckets.push({ hour: h, count: map.get(h) ?? 0 });
  }
  return buckets;
}

export function mapGamesBreakdown(
  rawAgg: Array<{
    _id: string;
    totalMatches: number;
    wins: number;
    losses: number;
    draws: number;
    uniquePlayers: string[];
  }>,
  todayAgg: Array<{ _id: string; count: number }>,
  totalGamesPlayed: number,
): AdminStatsGameItem[] {
  const todayMap = new Map<string, number>();
  for (const item of todayAgg) {
    todayMap.set(item._id, item.count);
  }

  return rawAgg.map((g) => {
    const regPlayers = g.uniquePlayers.filter(
      (id) =>
        Types.ObjectId.isValid(id) &&
        !id.startsWith('bot_') &&
        !id.startsWith('guest_') &&
        !id.startsWith('anon_'),
    ).length;
    const anonPlayers = g.uniquePlayers.filter(
      (id) =>
        !id.startsWith('bot_') &&
        (id.startsWith('guest_') ||
          id.startsWith('anon_') ||
          !Types.ObjectId.isValid(id)),
    ).length;

    const registeredMatches = Math.round(
      g.totalMatches * (regPlayers / Math.max(g.uniquePlayers.length, 1)),
    );
    const anonymousMatches = g.totalMatches - registeredMatches;

    return {
      gameId: g._id,
      totalMatches: g.totalMatches,
      matchesToday: todayMap.get(g._id) ?? 0,
      uniquePlayers: g.uniquePlayers.length,
      registeredMatches,
      anonymousMatches,
      registeredPlayers: regPlayers,
      anonymousPlayers: anonPlayers,
      wins: g.wins,
      losses: g.losses,
      draws: g.draws,
      sharePercentage:
        totalGamesPlayed > 0
          ? Number(((g.totalMatches / totalGamesPlayed) * 100).toFixed(1))
          : 0,
    };
  });
}

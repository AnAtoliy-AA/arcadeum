import 'server-only';
import { cookies } from 'next/headers';
import { resolveApiUrl } from '@/shared/lib/api-base';
import type { AdminStatisticsData } from '../types';

export const DEFAULT_ADMIN_STATISTICS: AdminStatisticsData = {
  timestamp: new Date().toISOString(),
  users: {
    totalUsers: 0,
    blockedUsers: 0,
    dau: 0,
    wau: 0,
    mau: 0,
    stickinessRate: 0,
    stickyFactorDauMau: 0,
    stickyFactorDauWau: 0,
    stickyFactorWauMau: 0,
    avgPlaytimePerActiveUserMinutes: 0,
    avgMatchesPerActiveUser: 0,
    inactiveUsersCount: 0,
    inactivityRate: 0,
    payingUsersCount: 0,
    payerConversionRate: 0,
    arpu: 0,
    arppu: 0,
    newUsersToday: 0,
    newUsers7d: 0,
    newUsers30d: 0,
    roleBreakdown: {},
    countryBreakdown: [],
  },
  games: {
    totalGamesPlayed: 0,
    gamesToday: 0,
    games7d: 0,
    games30d: 0,
    estimatedPlaytimeHours: 0,
    avgMatchDurationMinutes: 7.5,
    completionRate: 0,
    activeRooms: 0,
    waitingRooms: 0,
    byGame: [],
  },
  economy: {
    totalCoinsInCirculation: 0,
    totalGemsInCirculation: 0,
    totalArcadeumInCirculation: 0,
    totalPurchasesCount: 0,
    totalPurchasesRevenueUsd: 0,
    transactionsCount: 0,
    transactionsToday: 0,
    transactions7d: 0,
    reasonsBreakdown: [],
  },
  tournaments: {
    total: 0,
    liveOrOpen: 0,
    completed: 0,
    totalRegistrations: 0,
  },
  trends: {
    daily: [],
    hourlyActivity: [],
  },
};

async function adminFetch(path: string, init?: RequestInit): Promise<Response> {
  const cookieJar = await cookies();
  const token = cookieJar.get('access_token')?.value;
  const url = resolveApiUrl(path);

  return fetch(url, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export async function getAdminStatisticsData(): Promise<AdminStatisticsData> {
  try {
    const res = await adminFetch('/admin/statistics');
    if (!res.ok) {
      return DEFAULT_ADMIN_STATISTICS;
    }
    const data = (await res.json()) as unknown;
    if (data && typeof data === 'object' && 'users' in data) {
      return data as AdminStatisticsData;
    }
    return DEFAULT_ADMIN_STATISTICS;
  } catch {
    return DEFAULT_ADMIN_STATISTICS;
  }
}

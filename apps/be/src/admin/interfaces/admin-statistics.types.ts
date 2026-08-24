export interface AdminStatsUsers {
  totalUsers: number;
  blockedUsers: number;
  dau: number;
  wau: number;
  mau: number;
  stickinessRate: number;
  stickyFactorDauMau: number;
  stickyFactorDauWau: number;
  stickyFactorWauMau: number;
  avgPlaytimePerActiveUserMinutes: number;
  avgMatchesPerActiveUser: number;
  inactiveUsersCount: number;
  inactivityRate: number;
  payingUsersCount: number;
  payerConversionRate: number;
  arpu: number;
  arppu: number;
  newUsersToday: number;
  newUsers7d: number;
  newUsers30d: number;
  roleBreakdown: Record<string, number>;
  countryBreakdown: Array<{
    countryCode: string;
    count: number;
    percentage: number;
  }>;
}

export interface AdminStatsGameItem {
  gameId: string;
  totalMatches: number;
  matchesToday: number;
  uniquePlayers: number;
  wins: number;
  losses: number;
  draws: number;
  sharePercentage: number;
}

export interface AdminStatsGames {
  totalGamesPlayed: number;
  gamesToday: number;
  games7d: number;
  games30d: number;
  estimatedPlaytimeHours: number;
  avgMatchDurationMinutes: number;
  completionRate: number;
  activeRooms: number;
  waitingRooms: number;
  byGame: AdminStatsGameItem[];
}

export interface AdminStatsEconomy {
  totalCoinsInCirculation: number;
  totalGemsInCirculation: number;
  totalArcadeumInCirculation: number;
  totalPurchasesCount: number;
  totalPurchasesRevenueUsd: number;
  transactionsCount: number;
  transactionsToday: number;
  transactions7d: number;
  reasonsBreakdown: Array<{ reason: string; count: number; volume: number }>;
}

export interface AdminStatsTournaments {
  total: number;
  liveOrOpen: number;
  completed: number;
  totalRegistrations: number;
}

export interface AdminStatsDailyTrend {
  date: string;
  dau: number;
  games: number;
  newUsers: number;
  transactions: number;
}

export interface AdminStatsHourlyBucket {
  hour: number;
  count: number;
}

export interface AdminStatisticsResponse {
  timestamp: string;
  users: AdminStatsUsers;
  games: AdminStatsGames;
  economy: AdminStatsEconomy;
  tournaments: AdminStatsTournaments;
  trends: {
    daily: AdminStatsDailyTrend[];
    hourlyActivity: AdminStatsHourlyBucket[];
  };
}

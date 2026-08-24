import type { ReactElement } from 'react';
import { GlassCard, StatTile } from '@arcadeum/ui';
import type { AdminStatisticsData } from '../types';

export interface StatsKpiTranslations {
  dau?: string;
  mau?: string;
  wau?: string;
  stickiness?: string;
  totalUsers?: string;
  playtime?: string;
  totalGames?: string;
  revenue?: string;
  todaySuffix?: string;
}

interface StatsKpiGridProps {
  data: AdminStatisticsData;
  t?: StatsKpiTranslations;
}

export function StatsKpiGrid({ data, t }: StatsKpiGridProps): ReactElement {
  const { users, games, economy } = data;

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
      data-testid="stats-kpi-grid"
    >
      <GlassCard className="p-1 border border-[var(--borderColor)]">
        <StatTile
          label={t?.dau ?? 'DAU (Daily Active)'}
          value={users.dau.toLocaleString()}
          delta={
            users.newUsersToday > 0
              ? `+${users.newUsersToday} ${t?.todaySuffix ?? 'new today'}`
              : undefined
          }
          deltaType={users.newUsersToday > 0 ? 'increase' : 'neutral'}
          data-testid="stat-dau"
        />
      </GlassCard>

      <GlassCard className="p-1 border border-[var(--borderColor)]">
        <StatTile
          label={t?.mau ?? 'MAU (Monthly Active)'}
          value={users.mau.toLocaleString()}
          delta={`WAU: ${users.wau.toLocaleString()}`}
          deltaType="neutral"
          data-testid="stat-mau"
        />
      </GlassCard>

      <GlassCard className="p-1 border border-[var(--borderColor)]">
        <StatTile
          label={t?.stickiness ?? 'DAU / MAU Stickiness'}
          value={`${users.stickinessRate}%`}
          delta={users.stickinessRate >= 20 ? 'High Retention' : 'Normal'}
          deltaType={users.stickinessRate >= 20 ? 'increase' : 'neutral'}
          data-testid="stat-stickiness"
        />
      </GlassCard>

      <GlassCard className="p-1 border border-[var(--borderColor)]">
        <StatTile
          label={t?.totalUsers ?? 'Total Registered'}
          value={users.totalUsers.toLocaleString()}
          delta={
            users.blockedUsers > 0
              ? `${users.blockedUsers} restricted`
              : undefined
          }
          deltaType={users.blockedUsers > 0 ? 'decrease' : 'neutral'}
          data-testid="stat-total-users"
        />
      </GlassCard>

      <GlassCard className="p-1 border border-[var(--borderColor)]">
        <StatTile
          label={t?.totalGames ?? 'Total Games Played'}
          value={games.totalGamesPlayed.toLocaleString()}
          delta={
            games.gamesToday > 0 ? `+${games.gamesToday} today` : undefined
          }
          deltaType={games.gamesToday > 0 ? 'increase' : 'neutral'}
          data-testid="stat-total-games"
        />
      </GlassCard>

      <GlassCard className="p-1 border border-[var(--borderColor)]">
        <StatTile
          label={t?.playtime ?? 'Estimated Playtime'}
          value={`${games.estimatedPlaytimeHours.toLocaleString()} hrs`}
          delta={
            games.activeRooms > 0
              ? `${games.activeRooms} live matches`
              : '0 active'
          }
          deltaType={games.activeRooms > 0 ? 'increase' : 'neutral'}
          data-testid="stat-playtime"
        />
      </GlassCard>

      <GlassCard className="p-1 border border-[var(--borderColor)]">
        <StatTile
          label={t?.revenue ?? 'Gem Purchases Revenue'}
          value={`$${economy.totalPurchasesRevenueUsd.toLocaleString()}`}
          delta={`${economy.totalPurchasesCount} orders`}
          deltaType="increase"
          data-testid="stat-revenue"
        />
      </GlassCard>

      <GlassCard className="p-1 border border-[var(--borderColor)]">
        <StatTile
          label="Wallet Transactions"
          value={economy.transactionsCount.toLocaleString()}
          delta={
            economy.transactionsToday > 0
              ? `+${economy.transactionsToday} today`
              : undefined
          }
          deltaType="neutral"
          data-testid="stat-transactions"
        />
      </GlassCard>
    </div>
  );
}

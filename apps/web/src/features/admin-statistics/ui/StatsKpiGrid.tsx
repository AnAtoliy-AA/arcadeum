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
  mode?: 'all' | 'registered' | 'anonymous';
  t?: StatsKpiTranslations;
}

export function StatsKpiGrid({ data, mode = 'all', t }: StatsKpiGridProps): ReactElement {
  const { users, games, economy, registered, anonymous } = data;

  const totalUsersCount = users?.totalUsers ?? 0;
  const anonUsersCount = anonymous?.totalCount ?? users?.anonymous?.totalAnonymousPlayers ?? 0;
  const regTotal = registered?.totalCount ?? totalUsersCount;
  const anonTotal = anonUsersCount;

  const totalDau = users?.dau ?? 0;
  const regDau = registered?.dau ?? users?.registeredDau ?? (totalDau > 0 && anonUsersCount === 0 ? totalDau : 0);
  const anonDau = anonymous?.dau ?? users?.anonymousDau ?? (totalDau - regDau >= 0 ? totalDau - regDau : 0);

  const totalMau = users?.mau ?? 0;
  const regMau = registered?.mau ?? users?.registeredMau ?? (totalMau > 0 && anonUsersCount === 0 ? totalMau : 0);
  const anonMau = anonymous?.mau ?? users?.anonymousMau ?? (totalMau - regMau >= 0 ? totalMau - regMau : 0);

  const totalGamesCount = games?.totalGamesPlayed ?? 0;
  const regGamesTotal = registered?.gamesTotal ?? (totalGamesCount > 0 && anonUsersCount === 0 ? totalGamesCount : 0);
  const anonGamesTotal = anonymous?.gamesTotal ?? Math.max(totalGamesCount - regGamesTotal, 0);

  const totalGamesToday = games?.gamesToday ?? 0;
  const regGamesToday = registered?.gamesToday ?? (totalGamesToday > 0 && anonUsersCount === 0 ? totalGamesToday : 0);
  const anonGamesToday = anonymous?.gamesToday ?? Math.max(totalGamesToday - regGamesToday, 0);

  const totalPlaytimeHours = games?.estimatedPlaytimeHours ?? 0;
  const regPlaytime = registered?.estimatedPlaytimeHours ?? (totalPlaytimeHours > 0 && anonUsersCount === 0 ? totalPlaytimeHours : 0);
  const anonPlaytime = anonymous?.estimatedPlaytimeHours ?? Math.max(Number((totalPlaytimeHours - regPlaytime).toFixed(1)), 0);

  const displayDau =
    mode === 'registered' ? regDau : mode === 'anonymous' ? anonDau : totalDau;
  const displayMau =
    mode === 'registered' ? regMau : mode === 'anonymous' ? anonMau : totalMau;
  const displayWau =
    mode === 'registered'
      ? registered?.wau ?? users?.registeredWau ?? 0
      : mode === 'anonymous'
      ? anonymous?.wau ?? users?.anonymousWau ?? 0
      : users?.wau ?? 0;

  const displayStickiness =
    mode === 'registered'
      ? registered?.stickyFactorDauMau ?? users?.stickyFactorDauMau ?? 0
      : mode === 'anonymous'
      ? anonymous?.stickyFactorDauMau ?? 0
      : users?.stickinessRate ?? 0;

  const displayTotalUsers =
    mode === 'registered'
      ? regTotal
      : mode === 'anonymous'
      ? anonTotal
      : regTotal + anonTotal;

  const displayTotalGames =
    mode === 'registered'
      ? regGamesTotal
      : mode === 'anonymous'
      ? anonGamesTotal
      : totalGamesCount;

  const displayPlaytime =
    mode === 'registered'
      ? regPlaytime
      : mode === 'anonymous'
      ? anonPlaytime
      : totalPlaytimeHours;

  const totalRevenueUsd = economy?.totalPurchasesRevenueUsd ?? 0;
  const regRevenue = totalRevenueUsd;
  const anonRevenue = 0;
  const displayRevenue =
    mode === 'registered' ? regRevenue : mode === 'anonymous' ? anonRevenue : totalRevenueUsd;

  const totalTxCount = economy?.transactionsCount ?? 0;
  const regTxCount = totalTxCount;
  const anonTxCount = 0;
  const displayTxCount =
    mode === 'registered' ? regTxCount : mode === 'anonymous' ? anonTxCount : totalTxCount;

  const dauSubtext =
    mode === 'all'
      ? `Reg: ${regDau.toLocaleString()} | Anon: ${anonDau.toLocaleString()}`
      : mode === 'registered'
      ? `Registered Accounts`
      : `Anonymous & Guests`;

  const gamesSubtext =
    mode === 'all'
      ? `Reg: ${regGamesToday.toLocaleString()} | Anon: ${anonGamesToday.toLocaleString()}`
      : `Today: ${(mode === 'registered' ? regGamesToday : anonGamesToday).toLocaleString()}`;

  const revenueSubtext =
    mode === 'all'
      ? `Reg: $${regRevenue.toLocaleString()} | Anon: $0`
      : mode === 'registered'
      ? `${economy?.totalPurchasesCount ?? 0} orders (100% registered)`
      : `Guests cannot purchase gems`;

  const txSubtext =
    mode === 'all'
      ? `Reg: ${regTxCount.toLocaleString()} | Anon: 0`
      : mode === 'registered'
      ? economy?.transactionsToday && economy.transactionsToday > 0
        ? `+${economy.transactionsToday} today`
        : 'Registered wallets'
      : `Guests have no wallet`;

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
      data-testid="stats-kpi-grid"
    >
      <GlassCard className="p-1 border border-[var(--borderColor)]">
        <StatTile
          label={t?.dau ?? 'DAU (Daily Active)'}
          value={displayDau.toLocaleString()}
          delta={dauSubtext}
          deltaType={mode === 'all' ? 'increase' : 'neutral'}
          data-testid="stat-dau"
        />
      </GlassCard>

      <GlassCard className="p-1 border border-[var(--borderColor)]">
        <StatTile
          label={t?.mau ?? 'MAU (Monthly Active)'}
          value={displayMau.toLocaleString()}
          delta={
            mode === 'all'
              ? `Reg: ${regMau.toLocaleString()} | Anon: ${anonMau.toLocaleString()}`
              : `WAU: ${displayWau.toLocaleString()}`
          }
          deltaType="neutral"
          data-testid="stat-mau"
        />
      </GlassCard>

      <GlassCard className="p-1 border border-[var(--borderColor)]">
        <StatTile
          label={t?.stickiness ?? 'DAU / MAU Stickiness'}
          value={`${displayStickiness}%`}
          delta={displayStickiness >= 20 ? 'High Retention' : 'Normal'}
          deltaType={displayStickiness >= 20 ? 'increase' : 'neutral'}
          data-testid="stat-stickiness"
        />
      </GlassCard>

      <GlassCard className="p-1 border border-[var(--borderColor)]">
        <StatTile
          label={
            mode === 'registered'
              ? 'Registered Accounts'
              : mode === 'anonymous'
              ? 'Unique Guest Profiles'
              : t?.totalUsers ?? 'Total Profiles'
          }
          value={displayTotalUsers.toLocaleString()}
          delta={
            mode === 'all'
              ? `Reg: ${regTotal.toLocaleString()} | Anon: ${anonTotal.toLocaleString()}`
              : users?.blockedUsers > 0 && mode === 'registered'
              ? `${users.blockedUsers} restricted`
              : undefined
          }
          deltaType={users?.blockedUsers > 0 && mode === 'registered' ? 'decrease' : 'neutral'}
          data-testid="stat-total-users"
        />
      </GlassCard>

      <GlassCard className="p-1 border border-[var(--borderColor)]">
        <StatTile
          label={t?.totalGames ?? 'Total Games Played'}
          value={displayTotalGames.toLocaleString()}
          delta={gamesSubtext}
          deltaType="increase"
          data-testid="stat-total-games"
        />
      </GlassCard>

      <GlassCard className="p-1 border border-[var(--borderColor)]">
        <StatTile
          label={t?.playtime ?? 'Estimated Playtime'}
          value={`${displayPlaytime.toLocaleString()} hrs`}
          delta={
            mode === 'all'
              ? `Reg: ${regPlaytime}h | Anon: ${anonPlaytime}h`
              : `${games?.activeRooms ?? 0} active matches`
          }
          deltaType="increase"
          data-testid="stat-playtime"
        />
      </GlassCard>

      <GlassCard className="p-1 border border-[var(--borderColor)]">
        <StatTile
          label={t?.revenue ?? 'Gem Purchases Revenue'}
          value={`$${displayRevenue.toLocaleString()}`}
          delta={revenueSubtext}
          deltaType={displayRevenue > 0 ? 'increase' : 'neutral'}
          data-testid="stat-revenue"
        />
      </GlassCard>

      <GlassCard className="p-1 border border-[var(--borderColor)]">
        <StatTile
          label="Wallet Transactions"
          value={displayTxCount.toLocaleString()}
          delta={txSubtext}
          deltaType="neutral"
          data-testid="stat-transactions"
        />
      </GlassCard>
    </div>
  );
}

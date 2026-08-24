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

  const currentAudience =
    mode === 'registered' ? registered : mode === 'anonymous' ? anonymous : null;

  const regTotal = registered?.totalCount ?? users?.totalUsers ?? 0;
  const anonTotal = anonymous?.totalCount ?? users?.anonymous?.totalAnonymousPlayers ?? 0;
  const regDau = registered?.dau ?? users?.registeredDau ?? 0;
  const anonDau = anonymous?.dau ?? users?.anonymousDau ?? 0;
  const regMau = registered?.mau ?? users?.registeredMau ?? 0;
  const anonMau = anonymous?.mau ?? users?.anonymousMau ?? 0;
  const regGamesToday = registered?.gamesToday ?? 0;
  const anonGamesToday = anonymous?.gamesToday ?? 0;
  const regPlaytime = registered?.estimatedPlaytimeHours ?? 0;
  const anonPlaytime = anonymous?.estimatedPlaytimeHours ?? 0;

  const displayDau = currentAudience?.dau ?? users?.dau ?? 0;
  const displayMau = currentAudience?.mau ?? users?.mau ?? 0;
  const displayWau = currentAudience?.wau ?? users?.wau ?? 0;
  const displayStickiness =
    currentAudience?.stickyFactorDauMau ?? users?.stickinessRate ?? 0;

  const displayTotalUsers =
    mode === 'registered'
      ? regTotal
      : mode === 'anonymous'
      ? anonTotal
      : regTotal + anonTotal;

  const displayTotalGames =
    currentAudience?.gamesTotal ?? games?.totalGamesPlayed ?? 0;
  const displayPlaytime =
    currentAudience?.estimatedPlaytimeHours ?? games?.estimatedPlaytimeHours ?? 0;

  const dauSubtext =
    mode === 'all'
      ? `Reg: ${regDau.toLocaleString()} | Anon: ${anonDau.toLocaleString()}`
      : mode === 'registered'
      ? `Registered Accounts`
      : `Anonymous & Guests`;

  const gamesSubtext =
    mode === 'all'
      ? `Reg: ${regGamesToday.toLocaleString()} | Anon: ${anonGamesToday.toLocaleString()}`
      : `Today: ${currentAudience?.gamesToday?.toLocaleString() ?? 0}`;

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
          value={`$${(economy?.totalPurchasesRevenueUsd ?? 0).toLocaleString()}`}
          delta={`${economy?.totalPurchasesCount ?? 0} orders`}
          deltaType="increase"
          data-testid="stat-revenue"
        />
      </GlassCard>

      <GlassCard className="p-1 border border-[var(--borderColor)]">
        <StatTile
          label="Wallet Transactions"
          value={(economy?.transactionsCount ?? 0).toLocaleString()}
          delta={
            (economy?.transactionsToday ?? 0) > 0
              ? `+${economy?.transactionsToday} today`
              : undefined
          }
          deltaType="neutral"
          data-testid="stat-transactions"
        />
      </GlassCard>
    </div>
  );
}

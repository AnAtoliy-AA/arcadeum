import type { ReactElement } from 'react';
import { GlassCard, Typography, Badge, UserIcon } from '@arcadeum/ui';
import type { AdminStatsAnonymous, AdminStatsUsers } from '../types';

export interface StatsAnonymousTranslations {
  title?: string;
  subtitle?: string;
  guestShareLabel?: string;
  totalGuestsLabel?: string;
  guestDauLabel?: string;
  guestMauLabel?: string;
  guestGamesTodayLabel?: string;
  guestGamesTotalLabel?: string;
  conversionPotentialLabel?: string;
}

interface StatsAnonymousOverviewProps {
  anonymous: AdminStatsAnonymous;
  users: AdminStatsUsers;
  t?: StatsAnonymousTranslations;
}

export function StatsAnonymousOverview({
  anonymous,
  users,
  t,
}: StatsAnonymousOverviewProps): ReactElement {
  return (
    <GlassCard
      className="p-6 border border-[var(--borderColor)] flex flex-col gap-5 w-full"
      data-testid="stats-anonymous-overview"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex flex-row items-center gap-2">
            <UserIcon size={20} />
            <Typography variant="subheading" uiSize="md" weight="700">
              {t?.title ?? 'Anonymous & Guest Player Analytics'}
            </Typography>
          </div>
          <Typography variant="body" uiSize="sm" alpha="medium">
            {t?.subtitle ??
              'Telemetry on unregistered guest sessions, gameplay volume, and account conversion funnel'}
          </Typography>
        </div>

        <div className="flex flex-row items-center gap-3">
          <Badge variant="info" size="md">
            {anonymous.guestTrafficSharePercentage}% {t?.guestShareLabel ?? 'Guest Traffic Share'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[var(--borderColor)] flex flex-col gap-1">
          <span className="text-xs text-[var(--colorTextSecondary,#a1a1aa)]">
            {t?.guestDauLabel ?? 'Anonymous DAU (Daily)'}
          </span>
          <span className="text-2xl font-bold text-cyan-400">
            {anonymous.anonymousDau.toLocaleString()}
          </span>
          <span className="text-[11px] text-[var(--colorTextSecondary,#a1a1aa)]">
            Registered: {users.registeredDau.toLocaleString()}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[var(--borderColor)] flex flex-col gap-1">
          <span className="text-xs text-[var(--colorTextSecondary,#a1a1aa)]">
            {t?.guestMauLabel ?? 'Anonymous MAU (Monthly)'}
          </span>
          <span className="text-2xl font-bold text-purple-400">
            {anonymous.anonymousMau.toLocaleString()}
          </span>
          <span className="text-[11px] text-[var(--colorTextSecondary,#a1a1aa)]">
            Registered: {users.registeredMau.toLocaleString()}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[var(--borderColor)] flex flex-col gap-1">
          <span className="text-xs text-[var(--colorTextSecondary,#a1a1aa)]">
            {t?.guestGamesTodayLabel ?? 'Guest Matches Today'}
          </span>
          <span className="text-2xl font-bold text-amber-400">
            {anonymous.anonymousGamesToday.toLocaleString()}
          </span>
          <span className="text-[11px] text-[var(--colorTextSecondary,#a1a1aa)]">
            All Matches: {anonymous.anonymousGamesTotal.toLocaleString()}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[var(--borderColor)] flex flex-col gap-1">
          <span className="text-xs text-[var(--colorTextSecondary,#a1a1aa)]">
            {t?.totalGuestsLabel ?? 'Unique Guest Profiles'}
          </span>
          <span className="text-2xl font-bold text-emerald-400">
            {anonymous.totalAnonymousPlayers.toLocaleString()}
          </span>
          <span className="text-[11px] text-[var(--colorTextSecondary,#a1a1aa)]">
            {t?.conversionPotentialLabel ?? 'Growth conversion opportunity'}
          </span>
        </div>
      </div>
    </GlassCard>
  );
}

import type { ReactElement } from 'react';
import {
  GlassCard,
  Typography,
  UserIcon,
  GlobeIcon,
  GiftIcon,
  Badge,
} from '@arcadeum/ui';
import type { AdminStatsUsers, AdminStatsTournaments } from '../types';

export interface StatsDemographicsOverviewTranslations {
  rolesTitle?: string;
  countryTitle?: string;
  tournamentsTitle?: string;
  tournamentsSubtitle?: string;
  totalTournaments?: string;
  activeTournaments?: string;
  completedTournaments?: string;
  totalParticipants?: string;
  noCountries?: string;
}

interface StatsDemographicsOverviewProps {
  users: AdminStatsUsers;
  tournaments: AdminStatsTournaments;
  t?: StatsDemographicsOverviewTranslations;
}

export function StatsDemographicsOverview({
  users,
  tournaments,
  t,
}: StatsDemographicsOverviewProps): ReactElement {
  const { roleBreakdown, countryBreakdown, totalUsers } = users;
  const rolesList = Object.entries(roleBreakdown);

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full"
      data-testid="stats-demographics-overview"
    >
      <GlassCard className="p-6 border border-[var(--borderColor)] flex flex-col gap-4">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-2">
            <UserIcon size={18} />
            <Typography variant="subheading" uiSize="sm" weight="700">
              {t?.rolesTitle ?? 'Role Distribution'}
            </Typography>
          </div>
          <Badge variant="neutral" size="sm">
            {rolesList.length} Tiers
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {rolesList.map(([roleName, count]) => (
            <div
              key={roleName}
              className="p-2.5 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--borderColor)] flex flex-col gap-0.5"
            >
              <span className="text-[11px] uppercase tracking-wider text-[var(--colorTextSecondary,#a1a1aa)] font-semibold">
                {roleName}
              </span>
              <span className="text-base font-bold text-[var(--colorText)]">
                {count.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6 border border-[var(--borderColor)] flex flex-col gap-4">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-2">
            <GlobeIcon size={18} />
            <Typography variant="subheading" uiSize="sm" weight="700">
              {t?.countryTitle ?? 'Top Player Regions'}
            </Typography>
          </div>
          <Badge variant="neutral" size="sm">
            Geo IP
          </Badge>
        </div>

        {countryBreakdown.length === 0 ? (
          <div className="py-6 text-center text-xs text-[var(--colorTextSecondary,#a1a1aa)]">
            {t?.noCountries ?? 'No geographic data available'}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {countryBreakdown.map((item) => (
              <div
                key={item.countryCode}
                className="flex flex-col gap-1 text-xs"
              >
                <div className="flex flex-row items-center justify-between">
                  <span className="font-semibold text-[var(--colorText)]">
                    {item.countryCode.toUpperCase()}
                  </span>
                  <span className="text-[var(--colorTextSecondary,#a1a1aa)]">
                    {item.count} players ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <svg viewBox="0 0 100 6" className="w-full h-full block">
                    <rect
                      x={0}
                      y={0}
                      width={item.percentage}
                      height={6}
                      rx={3}
                      className="fill-indigo-400"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <GlassCard className="p-6 border border-[var(--borderColor)] flex flex-col justify-between gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-row items-center gap-2">
            <GiftIcon size={18} />
            <Typography variant="subheading" uiSize="sm" weight="700">
              {t?.tournamentsTitle ?? 'Tournaments & Competition'}
            </Typography>
          </div>
          <Typography variant="body" uiSize="xs" alpha="medium">
            {t?.tournamentsSubtitle ?? 'Competitive events and participation'}
          </Typography>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--borderColor)] flex flex-col">
              <span className="text-[10px] text-[var(--colorTextSecondary,#a1a1aa)] uppercase">
                {t?.totalTournaments ?? 'Total Events'}
              </span>
              <span className="text-lg font-bold text-[var(--colorText)]">
                {tournaments.total}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--borderColor)] flex flex-col">
              <span className="text-[10px] text-[var(--colorTextSecondary,#a1a1aa)] uppercase">
                {t?.activeTournaments ?? 'Live / Open'}
              </span>
              <span className="text-lg font-bold text-emerald-400">
                {tournaments.liveOrOpen}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--borderColor)] flex flex-col">
              <span className="text-[10px] text-[var(--colorTextSecondary,#a1a1aa)] uppercase">
                {t?.completedTournaments ?? 'Finished'}
              </span>
              <span className="text-lg font-bold text-[var(--colorTextSecondary,#d4d4d8)]">
                {tournaments.completed}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--borderColor)] flex flex-col">
              <span className="text-[10px] text-[var(--colorTextSecondary,#a1a1aa)] uppercase">
                {t?.totalParticipants ?? 'Registrations'}
              </span>
              <span className="text-lg font-bold text-cyan-400">
                {tournaments.totalRegistrations}
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[var(--borderColor)] text-xs text-[var(--colorTextSecondary,#a1a1aa)] flex flex-row items-center justify-between">
          <span>Active / Total User Ratio:</span>
          <span className="font-semibold text-emerald-400">
            {totalUsers > 0
              ? `${((users.mau / totalUsers) * 100).toFixed(1)}%`
              : '0%'}
          </span>
        </div>
      </GlassCard>
    </div>
  );
}

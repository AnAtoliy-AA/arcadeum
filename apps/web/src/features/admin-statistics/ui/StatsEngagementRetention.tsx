import type { ReactElement } from 'react';
import { GlassCard, Typography, Badge, BarChartIcon } from '@arcadeum/ui';
import type { AdminStatsUsers, AdminStatsGames, AdminStatsAudienceMetrics } from '../types';

export interface StatsEngagementTranslations {
  title?: string;
  subtitle?: string;
  stickyFactorsTitle?: string;
  dauMauLabel?: string;
  dauWauLabel?: string;
  wauMauLabel?: string;
  timePerUserTitle?: string;
  avgTimePerUser?: string;
  avgMatchesPerUser?: string;
  completionRate?: string;
  monetizationTitle?: string;
  arpuLabel?: string;
  arppuLabel?: string;
  payerConversionLabel?: string;
  churnTitle?: string;
  inactiveUsersLabel?: string;
}

interface StatsEngagementRetentionProps {
  users: AdminStatsUsers;
  games: AdminStatsGames;
  registered?: AdminStatsAudienceMetrics;
  anonymous?: AdminStatsAudienceMetrics;
  mode?: 'all' | 'registered' | 'anonymous';
  t?: StatsEngagementTranslations;
}

export function StatsEngagementRetention({
  users,
  games,
  registered,
  anonymous,
  mode = 'all',
  t,
}: StatsEngagementRetentionProps): ReactElement {
  const currentAudience =
    mode === 'registered' ? registered : mode === 'anonymous' ? anonymous : null;

  const dauMau = currentAudience ? currentAudience.stickyFactorDauMau : users.stickyFactorDauMau;
  const dauWau = currentAudience ? currentAudience.stickyFactorDauWau : users.stickyFactorDauWau;
  const wauMau = currentAudience ? currentAudience.stickyFactorWauMau : users.stickyFactorWauMau;
  const playtimePerUser = currentAudience
    ? currentAudience.avgPlaytimePerActiveUserMinutes
    : users.avgPlaytimePerActiveUserMinutes;
  const matchesPerUser = currentAudience
    ? currentAudience.avgMatchesPerActiveUser
    : users.avgMatchesPerActiveUser;
  const completionRate = currentAudience
    ? currentAudience.completionRate
    : games.completionRate;
  const inactiveCount = currentAudience
    ? currentAudience.inactiveCount
    : users.inactiveUsersCount;
  const inactivityRate = currentAudience
    ? currentAudience.inactivityRate
    : users.inactivityRate;

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full"
      data-testid="stats-engagement-retention"
    >
      <GlassCard className="p-5 border border-[var(--borderColor)] flex flex-col justify-between gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-2">
              <BarChartIcon size={18} />
              <Typography variant="subheading" uiSize="sm" weight="700">
                {t?.stickyFactorsTitle ?? 'Sticky Factors'}
              </Typography>
            </div>
            <Badge variant="info" size="sm">
              {mode === 'all' ? 'All Traffic' : mode === 'registered' ? 'Registered' : 'Guests'}
            </Badge>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-1">
              <div className="flex flex-row justify-between text-xs">
                <span className="text-[var(--colorTextSecondary,#a1a1aa)]">
                  {t?.dauMauLabel ?? 'DAU / MAU'}
                </span>
                <span className="font-bold text-[var(--primary)]">{dauMau}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <svg viewBox="0 0 100 6" className="w-full h-full block">
                  <rect
                    x={0}
                    y={0}
                    width={Math.min(dauMau, 100)}
                    height={6}
                    rx={3}
                    className="fill-[var(--primary)]"
                  />
                </svg>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex flex-row justify-between text-xs">
                <span className="text-[var(--colorTextSecondary,#a1a1aa)]">
                  {t?.dauWauLabel ?? 'DAU / WAU'}
                </span>
                <span className="font-bold text-cyan-400">{dauWau}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <svg viewBox="0 0 100 6" className="w-full h-full block">
                  <rect
                    x={0}
                    y={0}
                    width={Math.min(dauWau, 100)}
                    height={6}
                    rx={3}
                    className="fill-cyan-400"
                  />
                </svg>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex flex-row justify-between text-xs">
                <span className="text-[var(--colorTextSecondary,#a1a1aa)]">
                  {t?.wauMauLabel ?? 'WAU / MAU'}
                </span>
                <span className="font-bold text-purple-400">{wauMau}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <svg viewBox="0 0 100 6" className="w-full h-full block">
                  <rect
                    x={0}
                    y={0}
                    width={Math.min(wauMau, 100)}
                    height={6}
                    rx={3}
                    className="fill-purple-400"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-[var(--borderColor)] text-[11px] text-[var(--colorTextSecondary,#a1a1aa)]">
          {registered && anonymous && mode === 'all'
            ? `Reg DAU/MAU: ${registered.stickyFactorDauMau}% | Anon: ${anonymous.stickyFactorDauMau}%`
            : 'Higher ratio indicates habitual return rate'}
        </div>
      </GlassCard>

      <GlassCard className="p-5 border border-[var(--borderColor)] flex flex-col justify-between gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-row items-center justify-between">
            <Typography variant="subheading" uiSize="sm" weight="700">
              {t?.timePerUserTitle ?? 'Time & Activity / User'}
            </Typography>
            <Badge variant="neutral" size="sm">
              Session
            </Badge>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="p-2.5 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--borderColor)] flex flex-col">
              <span className="text-[10px] text-[var(--colorTextSecondary,#a1a1aa)] uppercase">
                {t?.avgTimePerUser ?? 'Avg Playtime / Active User'}
              </span>
              <span className="text-lg font-bold text-amber-400">
                {playtimePerUser} min / day
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--borderColor)] flex flex-col">
              <span className="text-[10px] text-[var(--colorTextSecondary,#a1a1aa)] uppercase">
                {t?.avgMatchesPerUser ?? 'Avg Matches / Active User'}
              </span>
              <span className="text-lg font-bold text-emerald-400">
                {matchesPerUser} matches
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-[var(--borderColor)] flex flex-row items-center justify-between text-xs">
          <span className="text-[var(--colorTextSecondary,#a1a1aa)]">
            {t?.completionRate ?? 'Match Completion'}:
          </span>
          <span className="font-semibold text-emerald-400">{completionRate}%</span>
        </div>
      </GlassCard>

      <GlassCard className="p-5 border border-[var(--borderColor)] flex flex-col justify-between gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-row items-center justify-between">
            <Typography variant="subheading" uiSize="sm" weight="700">
              {t?.monetizationTitle ?? 'Revenue & Value'}
            </Typography>
            <Badge variant="warning" size="sm">
              ARPU
            </Badge>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="p-2.5 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--borderColor)] flex flex-col">
              <span className="text-[10px] text-[var(--colorTextSecondary,#a1a1aa)] uppercase">
                {t?.arpuLabel ?? 'ARPU (Avg Revenue / User)'}
              </span>
              <span className="text-lg font-bold text-[var(--colorText)]">${users.arpu}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--borderColor)] flex flex-col">
              <span className="text-[10px] text-[var(--colorTextSecondary,#a1a1aa)] uppercase">
                {t?.arppuLabel ?? 'ARPPU (Paying Users)'}
              </span>
              <span className="text-lg font-bold text-emerald-400">${users.arppu}</span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-[var(--borderColor)] flex flex-row items-center justify-between text-xs">
          <span className="text-[var(--colorTextSecondary,#a1a1aa)]">
            {t?.payerConversionLabel ?? 'Paying Conversion'}:
          </span>
          <span className="font-semibold text-cyan-400">
            {users.payerConversionRate}% ({users.payingUsersCount})
          </span>
        </div>
      </GlassCard>

      <GlassCard className="p-5 border border-[var(--borderColor)] flex flex-col justify-between gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-row items-center justify-between">
            <Typography variant="subheading" uiSize="sm" weight="700">
              {t?.churnTitle ?? 'Retention & Inactivity'}
            </Typography>
            <Badge variant="neutral" size="sm">
              Cohorts
            </Badge>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="p-2.5 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--borderColor)] flex flex-col">
              <span className="text-[10px] text-[var(--colorTextSecondary,#a1a1aa)] uppercase">
                New Users (7d / 30d)
              </span>
              <span className="text-lg font-bold text-cyan-400">
                +{users.newUsers7d} / +{users.newUsers30d}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--borderColor)] flex flex-col">
              <span className="text-[10px] text-[var(--colorTextSecondary,#a1a1aa)] uppercase">
                {t?.inactiveUsersLabel ?? 'Inactive (> 30 Days)'}
              </span>
              <span className="text-lg font-bold text-[var(--colorTextSecondary,#a1a1aa)]">
                {inactiveCount} ({inactivityRate}%)
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-[var(--borderColor)] text-[11px] text-[var(--colorTextSecondary,#a1a1aa)]">
          {mode === 'all'
            ? `${users.totalUsers - users.inactiveUsersCount} active within 30 days`
            : mode === 'registered'
            ? `${users.totalUsers - users.inactiveUsersCount} active registered accounts`
            : `${users.anonymous.anonymousMau} active guests this month`}
        </div>
      </GlassCard>
    </div>
  );
}

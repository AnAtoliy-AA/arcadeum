import type { ReactElement } from 'react';
import { GlassCard, Typography, Badge, UserIcon } from '@arcadeum/ui';
import type { AdminStatsAnonymous, AdminStatsUsers, AdminStatsAudienceMetrics } from '../types';

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
  registered?: AdminStatsAudienceMetrics;
  anonymousAudience?: AdminStatsAudienceMetrics;
  t?: StatsAnonymousTranslations;
}

export function StatsAnonymousOverview({
  anonymous,
  users,
  registered,
  anonymousAudience,
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
              {t?.title ?? 'Registered vs Anonymous Player Segmentation'}
            </Typography>
          </div>
          <Typography variant="body" uiSize="sm" alpha="medium">
            {t?.subtitle ??
              'Complete side-by-side comparison of authenticated user accounts versus unregistered guest players'}
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
            Registered: {(registered?.gamesToday ?? 0).toLocaleString()}
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
            Registered: {users.totalUsers.toLocaleString()} accounts
          </span>
        </div>
      </div>

      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[var(--borderColor)] text-[var(--colorTextSecondary,#a1a1aa)] uppercase tracking-wider">
              <th className="py-2 px-3">Metric</th>
              <th className="py-2 px-3 text-right">Registered Users</th>
              <th className="py-2 px-3 text-right">Anonymous / Guests</th>
              <th className="py-2 px-3 text-right">Total (All Traffic)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--borderColor)]">
            <tr className="hover:bg-white/5 transition-colors">
              <td className="py-2.5 px-3 font-semibold text-[var(--colorText)]">Daily Active (DAU)</td>
              <td className="py-2.5 px-3 text-right font-medium text-emerald-400">{users.registeredDau.toLocaleString()}</td>
              <td className="py-2.5 px-3 text-right font-medium text-cyan-400">{users.anonymousDau.toLocaleString()}</td>
              <td className="py-2.5 px-3 text-right font-bold text-[var(--colorText)]">{users.dau.toLocaleString()}</td>
            </tr>
            <tr className="hover:bg-white/5 transition-colors">
              <td className="py-2.5 px-3 font-semibold text-[var(--colorText)]">Weekly Active (WAU)</td>
              <td className="py-2.5 px-3 text-right font-medium text-emerald-400">{users.registeredWau.toLocaleString()}</td>
              <td className="py-2.5 px-3 text-right font-medium text-cyan-400">{users.anonymousWau.toLocaleString()}</td>
              <td className="py-2.5 px-3 text-right font-bold text-[var(--colorText)]">{users.wau.toLocaleString()}</td>
            </tr>
            <tr className="hover:bg-white/5 transition-colors">
              <td className="py-2.5 px-3 font-semibold text-[var(--colorText)]">Monthly Active (MAU)</td>
              <td className="py-2.5 px-3 text-right font-medium text-emerald-400">{users.registeredMau.toLocaleString()}</td>
              <td className="py-2.5 px-3 text-right font-medium text-cyan-400">{users.anonymousMau.toLocaleString()}</td>
              <td className="py-2.5 px-3 text-right font-bold text-[var(--colorText)]">{users.mau.toLocaleString()}</td>
            </tr>
            <tr className="hover:bg-white/5 transition-colors">
              <td className="py-2.5 px-3 font-semibold text-[var(--colorText)]">Stickiness (DAU/MAU)</td>
              <td className="py-2.5 px-3 text-right font-medium text-emerald-400">{registered?.stickyFactorDauMau ?? users.stickyFactorDauMau}%</td>
              <td className="py-2.5 px-3 text-right font-medium text-cyan-400">{anonymousAudience?.stickyFactorDauMau ?? 0}%</td>
              <td className="py-2.5 px-3 text-right font-bold text-[var(--colorText)]">{users.stickinessRate}%</td>
            </tr>
            <tr className="hover:bg-white/5 transition-colors">
              <td className="py-2.5 px-3 font-semibold text-[var(--colorText)]">Avg Playtime / Active User</td>
              <td className="py-2.5 px-3 text-right font-medium text-emerald-400">{registered?.avgPlaytimePerActiveUserMinutes ?? users.avgPlaytimePerActiveUserMinutes} min</td>
              <td className="py-2.5 px-3 text-right font-medium text-cyan-400">{anonymousAudience?.avgPlaytimePerActiveUserMinutes ?? 0} min</td>
              <td className="py-2.5 px-3 text-right font-bold text-[var(--colorText)]">{users.avgPlaytimePerActiveUserMinutes} min</td>
            </tr>
            <tr className="hover:bg-white/5 transition-colors">
              <td className="py-2.5 px-3 font-semibold text-[var(--colorText)]">Total Matches Played</td>
              <td className="py-2.5 px-3 text-right font-medium text-emerald-400">{(registered?.gamesTotal ?? 0).toLocaleString()}</td>
              <td className="py-2.5 px-3 text-right font-medium text-cyan-400">{(anonymousAudience?.gamesTotal ?? 0).toLocaleString()}</td>
              <td className="py-2.5 px-3 text-right font-bold text-[var(--colorText)]">{(registered?.gamesTotal ?? 0) + (anonymousAudience?.gamesTotal ?? 0) > 0 ? ((registered?.gamesTotal ?? 0) + (anonymousAudience?.gamesTotal ?? 0)).toLocaleString() : users.totalUsers.toLocaleString()}</td>
            </tr>
            <tr className="hover:bg-white/5 transition-colors">
              <td className="py-2.5 px-3 font-semibold text-[var(--colorText)]">Match Completion Rate</td>
              <td className="py-2.5 px-3 text-right font-medium text-emerald-400">{registered?.completionRate ?? 95}%</td>
              <td className="py-2.5 px-3 text-right font-medium text-cyan-400">{anonymousAudience?.completionRate ?? 90}%</td>
              <td className="py-2.5 px-3 text-right font-bold text-[var(--colorText)]">{registered?.completionRate ?? 95}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

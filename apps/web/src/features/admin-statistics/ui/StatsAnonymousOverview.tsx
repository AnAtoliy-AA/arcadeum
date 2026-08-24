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
  anonymous?: AdminStatsAnonymous;
  users?: AdminStatsUsers;
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
  const guestShare = anonymous?.guestTrafficSharePercentage ?? 0;
  const anonDau = anonymous?.anonymousDau ?? users?.anonymousDau ?? 0;
  const regDau = registered?.dau ?? users?.registeredDau ?? 0;
  const anonMau = anonymous?.anonymousMau ?? users?.anonymousMau ?? 0;
  const regMau = registered?.mau ?? users?.registeredMau ?? 0;
  const anonWau = anonymousAudience?.wau ?? users?.anonymousWau ?? 0;
  const regWau = registered?.wau ?? users?.registeredWau ?? 0;
  const totalDau = users?.dau ?? regDau + anonDau;
  const totalWau = users?.wau ?? regWau + anonWau;
  const totalMau = users?.mau ?? regMau + anonMau;

  const anonGamesToday = anonymous?.anonymousGamesToday ?? anonymousAudience?.gamesToday ?? 0;
  const regGamesToday = registered?.gamesToday ?? 0;
  const totalAnonPlayers = anonymous?.totalAnonymousPlayers ?? anonymousAudience?.totalCount ?? 0;
  const totalRegUsers = users?.totalUsers ?? registered?.totalCount ?? 0;

  const regStickiness = registered?.stickyFactorDauMau ?? users?.stickyFactorDauMau ?? 0;
  const anonStickiness = anonymousAudience?.stickyFactorDauMau ?? 0;
  const totalStickiness = users?.stickinessRate ?? 0;

  const regPlaytime = registered?.avgPlaytimePerActiveUserMinutes ?? users?.avgPlaytimePerActiveUserMinutes ?? 0;
  const anonPlaytime = anonymousAudience?.avgPlaytimePerActiveUserMinutes ?? 0;
  const totalPlaytime = users?.avgPlaytimePerActiveUserMinutes ?? 0;

  const regGamesTotal = registered?.gamesTotal ?? 0;
  const anonGamesTotal = anonymousAudience?.gamesTotal ?? anonymous?.anonymousGamesTotal ?? 0;
  const totalGames = regGamesTotal + anonGamesTotal > 0 ? regGamesTotal + anonGamesTotal : totalRegUsers;

  const regCompletion = registered?.completionRate ?? 95;
  const anonCompletion = anonymousAudience?.completionRate ?? 90;

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
            {guestShare}% {t?.guestShareLabel ?? 'Guest Traffic Share'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[var(--borderColor)] flex flex-col gap-1">
          <span className="text-xs text-[var(--colorTextSecondary,#a1a1aa)]">
            {t?.guestDauLabel ?? 'Anonymous DAU (Daily)'}
          </span>
          <span className="text-2xl font-bold text-cyan-400">
            {anonDau.toLocaleString()}
          </span>
          <span className="text-[11px] text-[var(--colorTextSecondary,#a1a1aa)]">
            Registered: {regDau.toLocaleString()}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[var(--borderColor)] flex flex-col gap-1">
          <span className="text-xs text-[var(--colorTextSecondary,#a1a1aa)]">
            {t?.guestMauLabel ?? 'Anonymous MAU (Monthly)'}
          </span>
          <span className="text-2xl font-bold text-purple-400">
            {anonMau.toLocaleString()}
          </span>
          <span className="text-[11px] text-[var(--colorTextSecondary,#a1a1aa)]">
            Registered: {regMau.toLocaleString()}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[var(--borderColor)] flex flex-col gap-1">
          <span className="text-xs text-[var(--colorTextSecondary,#a1a1aa)]">
            {t?.guestGamesTodayLabel ?? 'Guest Matches Today'}
          </span>
          <span className="text-2xl font-bold text-amber-400">
            {anonGamesToday.toLocaleString()}
          </span>
          <span className="text-[11px] text-[var(--colorTextSecondary,#a1a1aa)]">
            Registered: {regGamesToday.toLocaleString()}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[var(--borderColor)] flex flex-col gap-1">
          <span className="text-xs text-[var(--colorTextSecondary,#a1a1aa)]">
            {t?.totalGuestsLabel ?? 'Unique Guest Profiles'}
          </span>
          <span className="text-2xl font-bold text-emerald-400">
            {totalAnonPlayers.toLocaleString()}
          </span>
          <span className="text-[11px] text-[var(--colorTextSecondary,#a1a1aa)]">
            Registered: {totalRegUsers.toLocaleString()} accounts
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
              <td className="py-2.5 px-3 text-right font-medium text-emerald-400">{regDau.toLocaleString()}</td>
              <td className="py-2.5 px-3 text-right font-medium text-cyan-400">{anonDau.toLocaleString()}</td>
              <td className="py-2.5 px-3 text-right font-bold text-[var(--colorText)]">{totalDau.toLocaleString()}</td>
            </tr>
            <tr className="hover:bg-white/5 transition-colors">
              <td className="py-2.5 px-3 font-semibold text-[var(--colorText)]">Weekly Active (WAU)</td>
              <td className="py-2.5 px-3 text-right font-medium text-emerald-400">{regWau.toLocaleString()}</td>
              <td className="py-2.5 px-3 text-right font-medium text-cyan-400">{anonWau.toLocaleString()}</td>
              <td className="py-2.5 px-3 text-right font-bold text-[var(--colorText)]">{totalWau.toLocaleString()}</td>
            </tr>
            <tr className="hover:bg-white/5 transition-colors">
              <td className="py-2.5 px-3 font-semibold text-[var(--colorText)]">Monthly Active (MAU)</td>
              <td className="py-2.5 px-3 text-right font-medium text-emerald-400">{regMau.toLocaleString()}</td>
              <td className="py-2.5 px-3 text-right font-medium text-cyan-400">{anonMau.toLocaleString()}</td>
              <td className="py-2.5 px-3 text-right font-bold text-[var(--colorText)]">{totalMau.toLocaleString()}</td>
            </tr>
            <tr className="hover:bg-white/5 transition-colors">
              <td className="py-2.5 px-3 font-semibold text-[var(--colorText)]">Stickiness (DAU/MAU)</td>
              <td className="py-2.5 px-3 text-right font-medium text-emerald-400">{regStickiness}%</td>
              <td className="py-2.5 px-3 text-right font-medium text-cyan-400">{anonStickiness}%</td>
              <td className="py-2.5 px-3 text-right font-bold text-[var(--colorText)]">{totalStickiness}%</td>
            </tr>
            <tr className="hover:bg-white/5 transition-colors">
              <td className="py-2.5 px-3 font-semibold text-[var(--colorText)]">Avg Playtime / Active User</td>
              <td className="py-2.5 px-3 text-right font-medium text-emerald-400">{regPlaytime} min</td>
              <td className="py-2.5 px-3 text-right font-medium text-cyan-400">{anonPlaytime} min</td>
              <td className="py-2.5 px-3 text-right font-bold text-[var(--colorText)]">{totalPlaytime} min</td>
            </tr>
            <tr className="hover:bg-white/5 transition-colors">
              <td className="py-2.5 px-3 font-semibold text-[var(--colorText)]">Total Matches Played</td>
              <td className="py-2.5 px-3 text-right font-medium text-emerald-400">{regGamesTotal.toLocaleString()}</td>
              <td className="py-2.5 px-3 text-right font-medium text-cyan-400">{anonGamesTotal.toLocaleString()}</td>
              <td className="py-2.5 px-3 text-right font-bold text-[var(--colorText)]">{totalGames.toLocaleString()}</td>
            </tr>
            <tr className="hover:bg-white/5 transition-colors">
              <td className="py-2.5 px-3 font-semibold text-[var(--colorText)]">Match Completion Rate</td>
              <td className="py-2.5 px-3 text-right font-medium text-emerald-400">{regCompletion}%</td>
              <td className="py-2.5 px-3 text-right font-medium text-cyan-400">{anonCompletion}%</td>
              <td className="py-2.5 px-3 text-right font-bold text-[var(--colorText)]">{regCompletion}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

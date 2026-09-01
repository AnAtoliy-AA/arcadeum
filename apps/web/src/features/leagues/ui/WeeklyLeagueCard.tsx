import React from 'react';
import {
  formatLeagueTimeRemaining,
  getLeagueZone,
  getTierColorClass,
  getWeeklyLeagueTimeRemaining,
  type LeagueParticipant,
  type LeagueTier,
} from '@/shared/lib/social-leagues';

interface WeeklyLeagueCardProps {
  tier: LeagueTier;
  participants: LeagueParticipant[];
  currentUserId?: string;
}

export const WeeklyLeagueCard: React.FC<WeeklyLeagueCardProps> = ({
  tier,
  participants,
  currentUserId,
}) => {
  const timeRemaining = getWeeklyLeagueTimeRemaining();
  const tierColorClass = getTierColorClass(tier);
  const formattedTier = tier.charAt(0).toUpperCase() + tier.slice(1);

  return (
    <div className="w-full rounded-2xl bg-[var(--card)] border border-[var(--cardBorder)] p-5 shadow-lg flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[var(--foreground)]">
                {formattedTier} League
              </h3>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${tierColorClass}`}
              >
                {tier}
              </span>
            </div>
            <p className="text-xs text-[var(--mutedForeground)]">
              Top 5 promote to next league · Bottom 5 demote
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-[var(--mutedForeground)] block">
            Season ends in
          </span>
          <span className="text-xs font-mono font-bold text-[var(--primary)]">
            {formatLeagueTimeRemaining(timeRemaining)}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[var(--glassBorder)] text-[var(--mutedForeground)]">
              <th className="pb-2 font-semibold w-12">#</th>
              <th className="pb-2 font-semibold">Player</th>
              <th className="pb-2 font-semibold text-right">Trophies</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--glassBorder)]">
            {participants.map((p) => {
              const zone = getLeagueZone(p.rank, participants.length);
              const isMe = p.isCurrentUser || p.userId === currentUserId;

              const zoneColor =
                zone === 'promotion'
                  ? 'border-l-2 border-emerald-400 bg-emerald-500/5'
                  : zone === 'demotion'
                    ? 'border-l-2 border-rose-400 bg-rose-500/5'
                    : '';

              return (
                <tr
                  key={p.userId}
                  className={`transition-colors ${zoneColor} ${
                    isMe
                      ? 'bg-[var(--primary)]/10 font-bold text-[var(--primary)]'
                      : 'hover:bg-[var(--surfaceHover)] text-[var(--foreground)]'
                  }`}
                >
                  <td className="py-2 px-2 font-mono">{p.rank}</td>
                  <td className="py-2 flex items-center gap-2">
                    <span>{p.username}</span>
                    {isMe && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-[var(--primary)] text-[var(--primaryForeground)] rounded-md">
                        YOU
                      </span>
                    )}
                  </td>
                  <td className="py-2 text-right font-mono font-semibold text-[var(--accent)]">
                    {p.trophies} 🏆
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

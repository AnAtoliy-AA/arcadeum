'use client';

import { GlassCard, EmptyState } from '@arcadeum/ui';
import type { EventParticipant } from '../model/types';

interface LeaderboardTranslations {
  leaderboard?: string;
  noParticipants?: string;
  points?: string;
  wins?: string;
  gamesPlayed?: string;
  mvp?: string;
  [key: string]: string | undefined;
}

export const EventLeaderboard = ({
  participants = [],
  mvpUserId,
  translations = {},
}: {
  participants: EventParticipant[];
  mvpUserId?: string | null;
  translations?: LeaderboardTranslations;
}) => {
  if (participants.length === 0) {
    return (
      <GlassCard className="p-8 rounded-2xl border border-[var(--glassBorder)] bg-[var(--glassBg)] flex flex-col items-center justify-center text-center">
        <EmptyState
          message={
            translations.noParticipants ??
            'No players have registered yet. Be the first to join!'
          }
        />
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-5 md:p-6 rounded-2xl border border-[var(--glassBorder)] bg-[var(--glassBg)] flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[var(--text)]">
          {translations.leaderboard ?? 'Event Leaderboard'}
        </h3>
        <span className="text-xs text-[var(--textMuted)]">
          {participants.length} {translations.gamesPlayed ?? 'players'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--glassBorder)] text-xs text-[var(--textMuted)] uppercase tracking-wider">
              <th className="pb-3 pl-2 w-12">#</th>
              <th className="pb-3">Player</th>
              <th className="pb-3 text-center">
                {translations.gamesPlayed ?? 'Games'}
              </th>
              <th className="pb-3 text-center">
                {translations.wins ?? 'Wins'}
              </th>
              <th className="pb-3 text-right pr-2">
                {translations.points ?? 'Points'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--glassBorder)]">
            {participants.map((p, idx) => {
              const rank = idx + 1;
              const isMvp = mvpUserId ? p.userId === mvpUserId : rank === 1;

              return (
                <tr
                  key={p.userId}
                  className={`hover:bg-[var(--surfaceHover)]/30 transition-colors ${
                    rank === 1 ? 'bg-[var(--gold)]/5' : ''
                  }`}
                >
                  <td className="py-3 pl-2 font-bold text-xs">
                    {rank === 1 ? (
                      <span className="w-6 h-6 rounded-full bg-[var(--gold)]/20 text-[var(--gold)] flex items-center justify-center font-bold">
                        1
                      </span>
                    ) : rank === 2 ? (
                      <span className="w-6 h-6 rounded-full bg-slate-400/20 text-slate-300 flex items-center justify-center font-bold">
                        2
                      </span>
                    ) : rank === 3 ? (
                      <span className="w-6 h-6 rounded-full bg-amber-600/20 text-amber-500 flex items-center justify-center font-bold">
                        3
                      </span>
                    ) : (
                      <span className="text-[var(--textMuted)] pl-2">
                        {rank}
                      </span>
                    )}
                  </td>
                  <td className="py-3 font-semibold text-[var(--text)]">
                    <div className="flex items-center gap-2">
                      <span>{p.displayName}</span>
                      {isMvp && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--gold)]/20 text-[var(--gold)] border border-[var(--gold)]/40">
                          {translations.mvp ?? 'MVP'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 text-center text-[var(--textMuted)]">
                    {p.gamesPlayed}
                  </td>
                  <td className="py-3 text-center font-medium text-[var(--success)]">
                    {p.wins}
                  </td>
                  <td className="py-3 text-right pr-2 font-extrabold text-[var(--primary)]">
                    {p.points} {translations.points ?? 'pts'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
};

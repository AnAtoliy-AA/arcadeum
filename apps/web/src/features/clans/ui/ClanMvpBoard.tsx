'use client';

import { useMemo } from 'react';
import { CosmeticSprite, RankBadge } from '@arcadeum/ui';
import type { ClanMvpEntry } from '../model/types';

interface ClanMvpBoardProps {
  mvps: ClanMvpEntry[];
  labels?: {
    mvpTitle?: string;
    mvpSubtitle?: string;
    rank?: string;
    player?: string;
    wins?: string;
    games?: string;
    winRate?: string;
    noMvps?: string;
  };
}

export function ClanMvpBoard({ mvps, labels }: ClanMvpBoardProps) {
  const ll = useMemo(
    () => ({
      mvpTitle: labels?.mvpTitle ?? 'Clan MVPs',
      mvpSubtitle:
        labels?.mvpSubtitle ??
        'Top contributors and victorious players in your clan this season.',
      rank: labels?.rank ?? 'Rank',
      player: labels?.player ?? 'Player',
      wins: labels?.wins ?? 'Wins',
      games: labels?.games ?? 'Games',
      winRate: labels?.winRate ?? 'Win Rate',
      noMvps: labels?.noMvps ?? 'No member match history recorded yet.',
    }),
    [labels],
  );

  return (
    <div
      className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm"
      data-testid="clan-mvp-board"
    >
      <div>
        <h3 className="text-lg font-bold text-[var(--foreground)]">
          {ll.mvpTitle}
        </h3>
        <p className="text-xs text-[var(--foreground)]/60">{ll.mvpSubtitle}</p>
      </div>

      {mvps.length === 0 ? (
        <div className="py-6 text-center text-xs text-[var(--foreground)]/60">
          {ll.noMvps}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--border)] text-[var(--foreground)]/60 uppercase">
              <tr>
                <th scope="col" className="py-2 px-2 text-center w-12">
                  {ll.rank}
                </th>
                <th scope="col" className="py-2 px-3">
                  {ll.player}
                </th>
                <th scope="col" className="py-2 px-3 text-right">
                  {ll.wins}
                </th>
                <th scope="col" className="py-2 px-3 text-right">
                  {ll.games}
                </th>
                <th scope="col" className="py-2 px-3 text-right">
                  {ll.winRate}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]/60">
              {mvps.map((entry) => (
                <tr
                  key={entry.userId}
                  data-testid={`mvp-row-${entry.username.toLowerCase()}`}
                  className="hover:bg-[var(--surfaceHover)] transition-colors"
                >
                  <td className="py-2.5 px-2 text-center">
                    <div className="flex items-center justify-center">
                      {entry.rank === 1 ? (
                        <RankBadge tier="gold">#1</RankBadge>
                      ) : entry.rank === 2 ? (
                        <RankBadge tier="silver">#2</RankBadge>
                      ) : entry.rank === 3 ? (
                        <RankBadge tier="bronze">#3</RankBadge>
                      ) : (
                        <span className="font-semibold text-[var(--foreground)]/70">
                          #{entry.rank}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 font-bold text-[var(--primary)]">
                        {entry.equippedAvatarId ? (
                          <CosmeticSprite
                            src={entry.equippedAvatarId}
                            alt={entry.username}
                            size={28}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          entry.username.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[var(--foreground)]">
                          {entry.displayName ?? entry.username}
                        </span>
                        <span className="text-[10px] text-[var(--foreground)]/50 capitalize">
                          {entry.role}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-[var(--foreground)]">
                    {entry.wins}
                  </td>
                  <td className="py-2.5 px-3 text-right text-[var(--foreground)]/70">
                    {entry.gamesPlayed}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="inline-flex rounded-full bg-[var(--success)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--success)]">
                      {entry.winRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

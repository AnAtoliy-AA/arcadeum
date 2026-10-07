'use client';

import { useMemo } from 'react';
import { CosmeticSprite, RankBadge } from '@arcadeum/ui';
import type { ClanLeaderboardEntry, ClanLeaderboardSort } from '../model/types';

interface ClanLeaderboardTableProps {
  entries: ClanLeaderboardEntry[];
  currentSort: ClanLeaderboardSort;
  onSortChange: (sort: ClanLeaderboardSort) => void;
  onSelectClan?: (clanId: string) => void;
  labels?: {
    rank?: string;
    clan?: string;
    members?: string;
    wins?: string;
    winRate?: string;
    sortByWins?: string;
    sortByWinRate?: string;
    sortByMembers?: string;
    noClansFound?: string;
  };
}

export function ClanLeaderboardTable({
  entries,
  currentSort,
  onSortChange,
  onSelectClan,
  labels,
}: ClanLeaderboardTableProps) {
  const ll = useMemo(
    () => ({
      rank: labels?.rank ?? 'Rank',
      clan: labels?.clan ?? 'Clan',
      members: labels?.members ?? 'Members',
      wins: labels?.wins ?? 'Wins',
      winRate: labels?.winRate ?? 'Win Rate',
      sortByWins: labels?.sortByWins ?? 'Most Wins',
      sortByWinRate: labels?.sortByWinRate ?? 'Win Rate',
      sortByMembers: labels?.sortByMembers ?? 'Members',
      noClansFound: labels?.noClansFound ?? 'No clans ranked yet',
    }),
    [labels],
  );

  return (
    <div
      className="flex flex-col gap-4"
      data-testid="clan-leaderboard-container"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm font-medium text-[var(--foreground)]/70">
          {entries.length} {ll.clan.toLowerCase()}
        </div>
        <div
          className="flex items-center gap-1 rounded-lg bg-[var(--surface)] p-1 border border-[var(--border)]"
          role="tablist"
          aria-label="Sort clans"
        >
          <button
            type="button"
            role="tab"
            aria-selected={currentSort === 'wins'}
            data-testid="sort-clan-wins"
            onClick={() => onSortChange('wins')}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
              currentSort === 'wins'
                ? 'bg-[var(--primary)] text-[var(--primaryForeground)] shadow-sm'
                : 'text-[var(--foreground)]/70 hover:text-[var(--foreground)]'
            }`}
          >
            {ll.sortByWins}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={currentSort === 'winRate'}
            data-testid="sort-clan-winrate"
            onClick={() => onSortChange('winRate')}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
              currentSort === 'winRate'
                ? 'bg-[var(--primary)] text-[var(--primaryForeground)] shadow-sm'
                : 'text-[var(--foreground)]/70 hover:text-[var(--foreground)]'
            }`}
          >
            {ll.sortByWinRate}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={currentSort === 'members'}
            data-testid="sort-clan-members"
            onClick={() => onSortChange('members')}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
              currentSort === 'members'
                ? 'bg-[var(--primary)] text-[var(--primaryForeground)] shadow-sm'
                : 'text-[var(--foreground)]/70 hover:text-[var(--foreground)]'
            }`}
          >
            {ll.sortByMembers}
          </button>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)]/40 py-12 text-center text-sm text-[var(--foreground)]/60">
          {ll.noClansFound}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="overflow-x-auto">
            <table
              className="w-full text-left text-sm"
              data-testid="clan-leaderboard-table"
            >
              <thead className="border-b border-[var(--border)] bg-[var(--surfaceHover)] text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]/70">
                <tr>
                  <th scope="col" className="px-4 py-3 text-center w-16">
                    {ll.rank}
                  </th>
                  <th scope="col" className="px-4 py-3">
                    {ll.clan}
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    {ll.members}
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    {ll.wins}
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    {ll.winRate}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {entries.map((entry) => (
                  <tr
                    key={entry.id}
                    data-testid={`clan-row-${entry.tag.toLowerCase()}`}
                    onClick={() => onSelectClan?.(entry.id)}
                    className="transition-colors hover:bg-[var(--surfaceHover)] cursor-pointer"
                  >
                    <td className="px-4 py-3 text-center">
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/15 font-bold text-[var(--color)]">
                          {entry.avatarUrl ? (
                            <CosmeticSprite
                              src={entry.avatarUrl}
                              alt={entry.name}
                              size={36}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            entry.tag.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-bold text-[var(--foreground)]">
                            <span className="truncate">{entry.name}</span>
                            <span className="shrink-0 text-xs text-[var(--primary)] font-mono">
                              [{entry.tag}]
                            </span>
                          </div>
                          {entry.description && (
                            <p className="truncate text-xs text-[var(--foreground)]/60 max-w-xs">
                              {entry.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[var(--foreground)]/80">
                      {entry.memberCount}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-[var(--foreground)]">
                      {entry.totalWins.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center rounded-full bg-[var(--success)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--success)]">
                        {entry.winRate}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { RatingBadge } from '@/features/ranking/ui/RatingBadge';
import type { RankingPlayer } from '@/features/ranking/model/types';
import { cx } from '@arcadeum/ui/utils/cx';

export interface CriticalRankedLeaderboardProps {
  entries: RankingPlayer[];
  loading?: boolean;
  title: string;
  subtitle: string;
  emptyMessage: string;
}

const MEDAL_EMOJIS: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

export function CriticalRankedLeaderboard({
  entries,
  loading = false,
  title,
  subtitle,
  emptyMessage,
}: CriticalRankedLeaderboardProps) {
  return (
    <div className="box-border flex flex-col gap-4">
      <div className="box-border flex flex-col gap-1">
        <h3 className="box-border m-0 text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)]">
          {title}
        </h3>
        <p className="box-border m-0 text-xs sm:text-sm text-[var(--foreground)] opacity-80">
          {subtitle}
        </p>
      </div>

      {loading ? (
        <div
          data-testid="ranked-leaderboard-loading"
          className="box-border flex items-center justify-center p-8 rounded-xl border border-[var(--borderColor)] bg-[var(--glassBg)]"
        >
          <div className="box-border w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div
          data-testid="ranked-leaderboard-empty"
          className="box-border flex flex-col items-center justify-center gap-2 p-8 rounded-xl border border-dashed border-[var(--borderColor)] bg-[var(--glassBg)] text-center"
        >
          <span className="box-border text-3xl" aria-hidden="true">
            🏆
          </span>
          <p className="box-border m-0 text-sm text-[var(--foreground)] opacity-80 max-w-md">
            {emptyMessage}
          </p>
        </div>
      ) : (
        <div
          data-testid="ranked-leaderboard-list"
          className="box-border flex flex-col divide-y divide-[var(--borderColor)] rounded-xl border border-[var(--borderColor)] bg-[var(--glassBg)] backdrop-blur-md overflow-hidden"
        >
          {entries.slice(0, 5).map((player) => {
            const totalMatches = player.wins + player.losses + player.draws;
            const winRate =
              totalMatches > 0
                ? Math.round((player.wins / totalMatches) * 100)
                : 0;
            const medal = MEDAL_EMOJIS[player.rank];

            return (
              <div
                key={player.userId}
                data-testid={`leaderboard-row-${player.rank}`}
                className="box-border flex items-center justify-between gap-3 p-3.5 transition-colors hover:bg-[var(--backgroundHover)]"
              >
                <div className="box-border flex items-center gap-3 min-w-0">
                  <span
                    className={cx(
                      'box-border flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black shrink-0',
                      medal
                        ? 'bg-[var(--primary)]/15 text-[var(--color)]'
                        : 'bg-[var(--surface)] text-[var(--textSecondary)]',
                    )}
                  >
                    {medal || `#${player.rank}`}
                  </span>

                  <div className="box-border flex flex-col min-w-0">
                    <span className="box-border text-sm font-bold text-[var(--foreground)] truncate">
                      {player.username}
                    </span>
                    <span className="box-border text-[11px] text-[var(--foreground)] opacity-70">
                      {player.wins}W - {player.losses}L ({winRate}%)
                    </span>
                  </div>
                </div>

                <div className="box-border shrink-0">
                  <RatingBadge elo={player.elo} tier={player.tier} size="sm" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

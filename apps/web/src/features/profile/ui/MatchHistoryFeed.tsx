'use client';

import Link from 'next/link';
import { Card, Badge } from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';
import type { HistorySummary } from '@/app/[locale]/(app)/history/types';

interface MatchHistoryFeedProps {
  userId: string;
  matches: HistorySummary[];
}

function getGameEmoji(gameId: string): string {
  if (gameId.includes('chess')) return '♟️';
  if (gameId.includes('checkers')) return '🔴';
  if (gameId.includes('sea_battle')) return '🚢';
  if (gameId.includes('backgammon')) return '🎲';
  if (
    gameId.includes('hearts') ||
    gameId.includes('spades') ||
    gameId.includes('cascade')
  )
    return '🃏';
  if (gameId.includes('go')) return '⚪';
  return '🎮';
}

export function MatchHistoryFeed({ userId, matches }: MatchHistoryFeedProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          <span className="text-[18px] font-bold">
            ⚔️ {t('games.common.profile.matchHistory')}
          </span>
          {matches.length > 0 && (
            <Badge variant="neutral" size="sm">
              {matches.length}
            </Badge>
          )}
        </div>
        <Link
          href="/history"
          className="text-[13px] text-[var(--color)] hover:underline"
        >
          {t('games.common.profile.viewAll')} →
        </Link>
      </div>

      {matches.length === 0 ? (
        <Card variant="default">
          <div className="py-6 text-center text-[13px] text-[var(--textSecondary)]">
            {t('games.common.profile.noMatches')}
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {matches.map((match) => {
            const opponents = match.participants
              .filter((p) => p.id !== userId)
              .map((p) => p.username || 'Opponent')
              .join(', ');

            const dateStr =
              match.lastActivityAt ||
              match.startedAt ||
              new Date().toISOString();

            return (
              <Card key={match.roomId} variant="default">
                <div className="flex flex-row items-center justify-between gap-3 text-[13px]">
                  <div className="flex flex-row items-center gap-3 min-w-0 flex-1">
                    <span className="text-[22px]">
                      {getGameEmoji(match.gameId)}
                    </span>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex flex-row items-center gap-2">
                        <span className="font-semibold text-[var(--color)] truncate">
                          {match.roomName ||
                            match.gameId
                              .replace(/_v\d+$/, '')
                              .replace(/_/g, ' ')}
                        </span>
                        <Badge variant="neutral" size="sm">
                          {match.status}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-[var(--textSecondary)] truncate">
                        {opponents ? `vs ${opponents}` : match.roomName}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[11px] text-[var(--textSecondary)]">
                      {new Date(dateStr).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <Link
                      href="/history"
                      className="text-[11px] text-[var(--primary)] hover:underline"
                    >
                      {t('games.common.profile.viewReplay')}
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

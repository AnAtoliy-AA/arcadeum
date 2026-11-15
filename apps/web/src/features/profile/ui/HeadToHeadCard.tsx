'use client';

import { Card, Badge, ProgressBar } from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';
import type { HeadToHeadResponse } from '@/features/history/api';

interface HeadToHeadCardProps {
  data: HeadToHeadResponse;
  myDisplayName: string;
  rivalDisplayName: string;
}

export function HeadToHeadCard({
  data,
  myDisplayName,
  rivalDisplayName,
}: HeadToHeadCardProps) {
  const { t } = useTranslation();

  const p1Wins = data.player1.wins;
  const p2Wins = data.player2.wins;
  const draws = data.player1.draws;
  const total = data.totalGames;

  const p1Percent = total > 0 ? Math.round((p1Wins / total) * 100) : 50;
  const p2Percent = total > 0 ? Math.round((p2Wins / total) * 100) : 50;

  return (
    <Card variant="default">
      <div className="flex flex-col gap-3">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-2">
            <span className="text-[18px] font-bold">
              ⚔️ {t('games.common.profile.headToHead')}
            </span>
            <Badge variant="neutral" size="sm">
              {total}
            </Badge>
          </div>
          <span className="text-[12px] text-[var(--textSecondary)]">
            {t('games.common.profile.totalGames')}: {total}
          </span>
        </div>

        {total === 0 ? (
          <div className="py-4 text-center text-[13px] text-[var(--textSecondary)]">
            {t('games.common.profile.noMatches')}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center justify-between text-[13px]">
              <div className="flex flex-col items-start">
                <span className="font-semibold text-[var(--primary)]">
                  {myDisplayName}
                </span>
                <span className="text-[12px] text-[var(--textSecondary)]">
                  {p1Wins} {t('games.common.profile.wins')} ({p1Percent}%)
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--textSecondary)]">
                  {t('games.common.profile.versus')}
                </span>
                {draws > 0 && (
                  <span className="text-[11px] text-[var(--textSecondary)]">
                    {draws} {t('games.common.profile.draws')}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-end">
                <span className="font-semibold text-[var(--warning)]">
                  {rivalDisplayName}
                </span>
                <span className="text-[12px] text-[var(--textSecondary)]">
                  {p2Wins} {t('games.common.profile.wins')} ({p2Percent}%)
                </span>
              </div>
            </div>

            <ProgressBar value={p1Percent} height={8} />
          </div>
        )}
      </div>
    </Card>
  );
}

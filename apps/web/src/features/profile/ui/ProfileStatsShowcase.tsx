'use client';

import { Card, Badge } from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';
import type { PlayerStats, TrendsResponse } from '@/features/history/api';

interface ProfileStatsShowcaseProps {
  stats: PlayerStats;
  trends?: TrendsResponse | null;
}

export function ProfileStatsShowcase({
  stats,
  trends,
}: ProfileStatsShowcaseProps) {
  const { t } = useTranslation();

  const formattedFavorite = stats.favoriteGame
    ? stats.favoriteGame.replace(/_v\d+$/, '').replace(/_/g, ' ')
    : null;

  return (
    <Card variant="default">
      <div className="flex flex-col gap-4">
        <div className="flex flex-row items-center justify-between">
          <span className="text-[18px] font-bold">
            📊 {t('games.common.profile.winRate')} &{' '}
            {t('games.common.profile.totalGames')}
          </span>
          <Badge variant="info" size="sm">
            {stats.winRate}% {t('games.common.profile.winRate')}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="flex flex-col gap-1 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[var(--backgroundHover)] p-3">
            <span className="text-[11px] uppercase tracking-wider text-[var(--textSecondary)]">
              {t('games.common.profile.totalGames')}
            </span>
            <span className="text-[18px] font-bold text-[var(--color)]">
              {stats.totalGames}
            </span>
          </div>
          <div className="flex flex-col gap-1 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[var(--backgroundHover)] p-3">
            <span className="text-[11px] uppercase tracking-wider text-[var(--textSecondary)]">
              {t('games.common.profile.wins')} /{' '}
              {t('games.common.profile.losses')}
            </span>
            <span className="text-[18px] font-bold text-[var(--success)]">
              {stats.wins}{' '}
              <span className="text-[13px] text-[var(--danger)]">
                / {stats.losses}
              </span>
            </span>
          </div>
          <div className="flex flex-col gap-1 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[var(--backgroundHover)] p-3">
            <span className="text-[11px] uppercase tracking-wider text-[var(--textSecondary)]">
              {t('games.common.profile.streak')}
            </span>
            <span className="text-[18px] font-bold text-[var(--color)]">
              {stats.currentStreak}
              {stats.currentStreakType && (
                <span className="ml-1 text-[12px] text-[var(--textSecondary)]">
                  (
                  {stats.currentStreakType === 'won'
                    ? t('games.common.profile.win')
                    : t('games.common.profile.loss')}
                  )
                </span>
              )}
            </span>
          </div>
          <div className="flex flex-col gap-1 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[var(--backgroundHover)] p-3">
            <span className="text-[11px] uppercase tracking-wider text-[var(--textSecondary)]">
              {t('games.common.profile.bestStreak')}
            </span>
            <span className="text-[18px] font-bold text-[var(--warning)]">
              🔥 {stats.bestWinStreak}
            </span>
          </div>
        </div>

        {trends && trends.records.length > 0 && (
          <div className="flex flex-col gap-2 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3">
            <div className="flex flex-row items-center justify-between">
              <span className="text-[12px] font-semibold text-[var(--textSecondary)]">
                {t('games.common.profile.recentForm')}
              </span>
              <span className="text-[11px] text-[var(--textSecondary)]">
                {trends.records.length} {t('games.common.profile.totalGames')}
              </span>
            </div>
            <div className="flex flex-row flex-wrap gap-1.5">
              {trends.records.map((r, index) => {
                const variant =
                  r.result === 'won'
                    ? 'success'
                    : r.result === 'lost'
                      ? 'error'
                      : 'neutral';
                const label =
                  r.result === 'won'
                    ? t('games.common.profile.win')
                    : r.result === 'lost'
                      ? t('games.common.profile.loss')
                      : t('games.common.profile.draw');
                return (
                  <Badge
                    key={`${r.sessionId}-${index}`}
                    variant={variant}
                    size="sm"
                  >
                    {label[0]}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {formattedFavorite && (
          <div className="flex flex-row items-center justify-between text-[13px] text-[var(--textSecondary)]">
            <span>{t('games.common.profile.favoriteGame')}:</span>
            <span className="font-semibold capitalize text-[var(--color)]">
              {formattedFavorite}
            </span>
          </div>
        )}

        {stats.byGameType && stats.byGameType.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[14px] font-semibold text-[var(--color)]">
              {t('games.common.profile.allGames')}
            </span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {stats.byGameType.map((gt) => (
                <div
                  key={gt.gameId}
                  className="flex flex-row items-center justify-between rounded-lg border border-[rgba(255,255,255,0.04)] bg-[var(--backgroundHover)] p-2.5 text-[13px]"
                >
                  <span className="font-medium capitalize text-[var(--color)]">
                    {gt.gameId.replace(/_v\d+$/, '').replace(/_/g, ' ')}
                  </span>
                  <div className="flex flex-row items-center gap-2">
                    <span className="text-[12px] text-[var(--textSecondary)]">
                      {gt.wins}/{gt.totalGames} ({gt.winRate}%)
                    </span>
                    <Badge
                      variant={gt.winRate >= 50 ? 'success' : 'neutral'}
                      size="sm"
                    >
                      {gt.winRate}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

'use client';

import type React from 'react';
import type { PlayerStats } from '@/features/history/api';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';
import { Card, SkeletonText, ProgressCircle } from '@arcadeum/ui';

interface StatsOverviewProps {
  stats: PlayerStats | null;
  loading: boolean;
  currentStreak?: number;
  currentStreakType?: 'won' | 'lost' | null;
  bestWinStreak?: number;
  favoriteGame?: string | null;
  level?: number;
  xp?: number;
}

export function StatsOverview({
  stats,
  loading,
  currentStreak,
  currentStreakType,
  bestWinStreak,
  favoriteGame,
  xp = 0,
}: StatsOverviewProps) {
  const { t } = useTranslation();

  if (loading && !stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card
            key={i}
            variant="glass"
            padding="md"
            className="flex flex-col gap-2"
          >
            <SkeletonText className="h-3.5 w-[60%]" delay={i * 0.1} />
            <SkeletonText width="80px" height="32px" delay={i * 0.1 + 0.05} />
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      <Card
        variant="glass"
        padding="md"
        className="flex flex-col items-center justify-center text-center gap-1 border-[var(--borderColor)]/70 hover:border-[var(--borderColor)] transition-colors"
      >
        <span className="text-[11px] uppercase font-bold tracking-wider text-[var(--textSecondary)]">
          {t('stats.totalGames' as TranslationKey)}
        </span>
        <span
          data-testid="stats-total-games"
          className="text-[28px] sm:text-[32px] font-black leading-tight text-[var(--color)] tracking-tight"
        >
          {stats.totalGames}
        </span>
      </Card>

      <Card
        variant="glass"
        padding="md"
        className="flex flex-col items-center justify-center text-center gap-1 border-[var(--borderColor)]/70 hover:border-[var(--borderColor)] transition-colors"
      >
        <span className="text-[11px] uppercase font-bold tracking-wider text-[var(--textSecondary)]">
          {t('stats.wins' as TranslationKey)}
        </span>
        <span
          data-testid="stats-wins"
          className="text-[28px] sm:text-[32px] font-black leading-tight text-[var(--success)] tracking-tight"
        >
          {stats.wins}
        </span>
      </Card>

      <Card
        variant="glass"
        padding="md"
        className="flex flex-col items-center justify-center text-center gap-1 border-[var(--borderColor)]/70 hover:border-[var(--borderColor)] transition-colors"
      >
        <span className="text-[11px] uppercase font-bold tracking-wider text-[var(--textSecondary)]">
          {t('stats.losses' as TranslationKey)}
        </span>
        <span
          data-testid="stats-losses"
          className="text-[28px] sm:text-[32px] font-black leading-tight text-[var(--danger)] tracking-tight"
        >
          {stats.losses}
        </span>
      </Card>

      <Card
        variant="glass"
        padding="md"
        className="flex flex-col items-center justify-center text-center gap-1 border-[var(--borderColor)]/70 hover:border-[var(--borderColor)] transition-colors"
      >
        <span className="text-[11px] uppercase font-bold tracking-wider text-[var(--textSecondary)]">
          {t('stats.winRate' as TranslationKey)}
        </span>
        <div className="flex items-center justify-center my-0.5">
          <ProgressCircle value={stats.winRate} size={64} strokeWidth={6} />
        </div>
      </Card>

      <Card
        variant="glass"
        padding="md"
        className="flex flex-col items-center justify-center text-center gap-1 border-[var(--borderColor)]/70 hover:border-[var(--borderColor)] transition-colors"
      >
        <span className="text-[11px] uppercase font-bold tracking-wider text-[var(--textSecondary)]">
          {t('stats.totalXP' as TranslationKey)}
        </span>
        <span
          data-testid="stats-total-xp"
          className="text-[24px] sm:text-[28px] font-black leading-tight text-amber-400 tracking-tight"
        >
          {xp.toLocaleString()}
        </span>
      </Card>

      {currentStreak != null && currentStreak > 0 ? (
        <Card
          variant="glass"
          padding="md"
          className="flex flex-col items-center justify-center text-center gap-1 border-[var(--borderColor)]/70 hover:border-[var(--borderColor)] transition-colors"
        >
          <span className="text-[11px] uppercase font-bold tracking-wider text-[var(--textSecondary)]">
            {t('stats.currentStreak' as TranslationKey)}
          </span>
          <span
            data-testid="stats-current-streak"
            className={`text-[28px] sm:text-[32px] font-black leading-tight tracking-tight ${
              currentStreakType === 'won'
                ? 'text-[var(--success)]'
                : 'text-[var(--danger)]'
            }`}
          >
            {currentStreak}
            <span className="text-[18px] ml-0.5 text-[var(--textSecondary)] font-bold">
              {currentStreakType === 'won' ? 'W' : 'L'}
            </span>
          </span>
        </Card>
      ) : bestWinStreak != null && bestWinStreak > 0 ? (
        <Card
          variant="glass"
          padding="md"
          className="flex flex-col items-center justify-center text-center gap-1 border-[var(--borderColor)]/70 hover:border-[var(--borderColor)] transition-colors"
        >
          <span className="text-[11px] uppercase font-bold tracking-wider text-[var(--textSecondary)]">
            {t('stats.bestWinStreak' as TranslationKey)}
          </span>
          <span
            data-testid="stats-best-win-streak"
            className="text-[28px] sm:text-[32px] font-black leading-tight text-[var(--success)] tracking-tight"
          >
            {bestWinStreak}
            <span className="text-[18px] ml-0.5 text-[var(--textSecondary)] font-bold">
              W
            </span>
          </span>
        </Card>
      ) : favoriteGame ? (
        <Card
          variant="glass"
          padding="md"
          className="flex flex-col items-center justify-center text-center gap-1 border-[var(--borderColor)]/70 hover:border-[var(--borderColor)] transition-colors"
        >
          <span className="text-[11px] uppercase font-bold tracking-wider text-[var(--textSecondary)]">
            {t('stats.favoriteGame' as TranslationKey)}
          </span>
          <span
            data-testid="stats-favorite-game"
            className="text-[22px] font-bold text-[var(--color)] truncate max-w-full"
          >
            {favoriteGame}
          </span>
        </Card>
      ) : (
        <Card
          variant="glass"
          padding="md"
          className="flex flex-col items-center justify-center text-center gap-1 border-[var(--borderColor)]/70 hover:border-[var(--borderColor)] transition-colors"
        >
          <span className="text-[11px] uppercase font-bold tracking-wider text-[var(--textSecondary)]">
            {t('stats.favoriteGame' as TranslationKey)}
          </span>
          <span
            data-testid="stats-favorite-game"
            className="text-[20px] font-bold text-[var(--textSecondary)]"
          >
            —
          </span>
        </Card>
      )}
    </div>
  );
}

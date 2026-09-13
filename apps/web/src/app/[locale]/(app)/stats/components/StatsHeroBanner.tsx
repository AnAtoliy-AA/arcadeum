'use client';

import type React from 'react';
import { Card, ProgressBar, Badge } from '@arcadeum/ui';
import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar';
import { xpProgress } from '@/shared/lib/xp-level';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';
import type { SessionTokensSnapshot } from '@/entities/session/model/types';
import type { PlayerStats } from '@/features/history/api';

interface StatsHeroBannerProps {
  snapshot: SessionTokensSnapshot;
  stats: PlayerStats | null;
  currentStreak?: number;
  currentStreakType?: 'won' | 'lost' | null;
}

export function StatsHeroBanner({
  snapshot,
  stats,
  currentStreak,
  currentStreakType,
}: StatsHeroBannerProps) {
  const { t } = useTranslation();
  const level = snapshot.level || 1;
  const xp = snapshot.xp || 0;
  const { progress, xpInLevel, xpNeeded } = xpProgress(xp);
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(progress * 100)),
  );
  const displayName =
    snapshot.displayName ||
    snapshot.username ||
    t('stats.player' as TranslationKey);

  return (
    <Card
      variant="glass"
      padding="lg"
      className="relative overflow-hidden border-[var(--borderColor)] bg-[var(--surfaceSecondary)] backdrop-blur-md shadow-xl"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="relative flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="relative flex-shrink-0">
            <EquippedPlayerAvatar
              name={displayName}
              size="lg"
              equippedAvatarId={snapshot.equippedAvatarId}
              equippedBadgeId={snapshot.equippedBadgeId}
              equippedNameColorId={snapshot.equippedNameColorId}
              equippedFrameId={snapshot.equippedFrameId}
              equippedAuraId={snapshot.equippedAuraId}
              equippedBannerId={snapshot.equippedBannerId}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-[22px] sm:text-[26px] font-black tracking-tight text-[var(--color)]">
                {displayName}
              </h2>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-300 font-extrabold text-[12px] tracking-wide shadow-sm">
                <span>LV.</span>
                <span data-testid="stats-level">{level}</span>
              </div>
              {snapshot.prestige > 0 && (
                <Badge variant="warning" size="sm">
                  {t('stats.prestige' as TranslationKey)} {snapshot.prestige}
                </Badge>
              )}
            </div>

            <div className="flex flex-col gap-1.5 min-w-[240px] sm:min-w-[280px]">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--textSecondary)]">
                <span>
                  {xpInLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP
                </span>
                <span className="text-violet-400 font-bold">
                  {progressPercent}%
                </span>
              </div>
              <ProgressBar
                value={progressPercent}
                className="h-2.5"
                color="var(--primary)"
              />
              <span className="text-[10px] text-[var(--textSecondary)]">
                {xp.toLocaleString()} {t('stats.totalXP' as TranslationKey)} •{' '}
                {(xpNeeded - xpInLevel).toLocaleString()}{' '}
                {t('stats.xpToNextLevel' as TranslationKey)}
              </span>
            </div>
          </div>
        </div>

        {stats && (
          <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto mt-2 md:mt-0">
            <div className="flex flex-col items-center justify-center min-w-[90px] px-3 py-2 rounded-xl bg-[var(--surfaceTertiary)]/30 border border-[var(--borderColor)]/60">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--textSecondary)]">
                {t('stats.winRate' as TranslationKey)}
              </span>
              <span className="text-[20px] font-black text-emerald-400">
                {stats.winRate}%
              </span>
            </div>

            <div className="flex flex-col items-center justify-center min-w-[90px] px-3 py-2 rounded-xl bg-[var(--surfaceTertiary)]/30 border border-[var(--borderColor)]/60">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--textSecondary)]">
                {t('stats.totalGames' as TranslationKey)}
              </span>
              <span className="text-[20px] font-black text-[var(--color)]">
                {stats.totalGames}
              </span>
            </div>

            {currentStreak != null && currentStreak > 0 && (
              <div className="flex flex-col items-center justify-center min-w-[90px] px-3 py-2 rounded-xl bg-[var(--surfaceTertiary)]/30 border border-[var(--borderColor)]/60">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--textSecondary)]">
                  {t('stats.currentStreak' as TranslationKey)}
                </span>
                <span
                  className={`text-[20px] font-black ${
                    currentStreakType === 'won'
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {currentStreak}
                  <span className="text-[14px] ml-0.5">
                    {currentStreakType === 'won' ? 'W' : 'L'}
                  </span>
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

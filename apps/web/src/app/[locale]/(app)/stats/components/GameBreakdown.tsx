'use client';

import React from 'react';
import Image from 'next/image';
import type { PlayerStats } from '@/features/history/api';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';
import { SkeletonCircle, SkeletonText, ProgressBar, Card } from '@arcadeum/ui';
import { gameMetadata } from '@/features/games/registry';
import type { GameSlug } from '@/features/games/registry.types';

interface GameBreakdownProps {
  stats: PlayerStats | null;
  loading: boolean;
}

export function GameBreakdown({ stats, loading }: GameBreakdownProps) {
  const { t } = useTranslation();

  if (loading && !stats) {
    return (
      <Card
        variant="glass"
        padding="md"
        className="flex flex-col gap-4 border-[var(--borderColor)] shadow-lg"
      >
        <div className="flex items-center gap-2">
          <span className="text-[18px]">🎮</span>
          <h3 className="text-[17px] font-bold tracking-tight text-[var(--color)]">
            {t('stats.gameBreakdownTitle')}
          </h3>
        </div>
        <div className="flex flex-col w-full rounded-xl overflow-hidden border border-[var(--borderColor)]/50">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3.5 border-b border-[var(--borderColor)]/40 bg-[var(--surfaceSecondary)]/40"
            >
              <div className="flex items-center gap-3">
                <SkeletonCircle width="40px" height="40px" delay={i * 0.1} />
                <SkeletonText width="120px" delay={i * 0.1 + 0.05} />
              </div>
              <SkeletonText width="60px" delay={i * 0.1 + 0.1} />
              <SkeletonText width="80px" delay={i * 0.1 + 0.2} />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!stats?.byGameType?.length) return null;

  return (
    <Card
      variant="glass"
      padding="md"
      className="flex flex-col gap-4 border-[var(--borderColor)] shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[18px]">🎮</span>
          <h3 className="text-[17px] font-bold tracking-tight text-[var(--color)]">
            {t('stats.gameBreakdownTitle')}
          </h3>
        </div>
        <span className="text-[12px] font-semibold text-[var(--textSecondary)]">
          {stats.byGameType.length} {t('stats.games' as TranslationKey)}
        </span>
      </div>

      <div className="flex flex-col w-full rounded-xl overflow-hidden border border-[var(--borderColor)]/50 bg-[var(--surfaceSecondary)]/30">
        <div className="grid grid-cols-2 sm:grid-cols-[2.5fr_1fr_1fr_1.5fr] p-3 px-4 bg-[var(--surfaceTertiary)]/40 border-b border-[var(--borderColor)]/50 text-[11px] font-bold uppercase tracking-wider text-[var(--textSecondary)]">
          <div>{t('stats.game')}</div>
          <div className="hidden sm:block text-right">{t('stats.total')}</div>
          <div className="hidden sm:block text-right">{t('stats.wins')}</div>
          <div className="text-right sm:text-left sm:pl-4">
            {t('stats.winRate')}
          </div>
        </div>

        <div className="divide-y divide-[var(--borderColor)]/30">
          {stats.byGameType.map((game) => {
            const meta = gameMetadata[game.gameId as GameSlug];
            const gameTitle =
              t(`games.${game.gameId}.name` as TranslationKey) ||
              meta?.name ||
              game.gameId;

            return (
              <div
                key={game.gameId}
                className="stats-breakdown-row grid grid-cols-2 sm:grid-cols-[2.5fr_1fr_1fr_1.5fr] items-center p-3 px-4 hover:bg-[var(--surfaceHover)]/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden bg-[var(--surfaceTertiary)] border border-[var(--borderColor)]/60 shadow-sm flex-shrink-0">
                    {meta?.thumbnail ? (
                      <Image
                        src={meta.thumbnail}
                        alt={gameTitle}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[18px]">🎲</span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[14px] font-bold text-[var(--color)] truncate">
                      {gameTitle}
                    </span>
                    {meta?.category && (
                      <span className="text-[11px] text-[var(--textSecondary)] truncate">
                        {meta.category}
                      </span>
                    )}
                  </div>
                </div>

                <div className="hidden sm:block text-right text-[14px] font-semibold text-[var(--color)] font-mono">
                  {game.totalGames}
                </div>

                <div className="hidden sm:block text-right text-[14px] font-bold text-[var(--success)] font-mono">
                  {game.wins}
                </div>

                <div className="flex items-center justify-end sm:justify-start sm:pl-4 min-w-[100px]">
                  <div className="w-full sm:max-w-[140px]">
                    <ProgressBar
                      className="h-2"
                      value={game.winRate}
                      showLabel
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import type { GameMetadata } from '../types';
import { Card as SharedCard, Badge } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';

interface GameCardProps {
  game: GameMetadata;
  className?: string;
  onClick?: () => void;
  showDetails?: boolean;
  disabled?: boolean;
}

function getStatusVariant(
  status: string,
): 'success' | 'info' | 'warning' | 'error' | 'neutral' {
  switch (status) {
    case 'active':
      return 'success';
    case 'beta':
      return 'info';
    case 'experimental':
      return 'warning';
    case 'deprecated':
      return 'error';
    default:
      return 'neutral';
  }
}

export function GameCard({
  game,
  className,
  onClick,
  showDetails = false,
  disabled = false,
}: GameCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const locale = pathname?.split('/')[1] ?? 'en';

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
    const landingSlug = game.slug.replace(/_v\d+$/, '');
    router.push(`/${locale}/games/${landingSlug}`);
  };

  return (
    <SharedCard
      className={cx(
        'p-4 transition-all duration-300 ease-out',
        disabled
          ? 'opacity-60 cursor-not-allowed'
          : 'cursor-pointer hover:-translate-y-[2px] hover:shadow-[0_0_25px_rgba(0,0,0,0.15)] hover:border-[var(--primary)] active:translate-y-0 active:scale-[0.98]',
        className,
      )}
      onClick={handleClick}
    >
      <div className="flex flex-row items-start absolute top-2 left-2">
        <Badge variant={getStatusVariant(game.status)} size="sm">
          {game.status}
        </Badge>
      </div>

      <div
        className={cx(
          'w-[60px] h-[60px] rounded-[8px] bg-[var(--backgroundFocus)] border-2 border-[var(--borderColor)] mb-3 flex items-center justify-center',
        )}
        {...(game.thumbnail
          ? {
              style: {
                background: `url(${game.thumbnail}) center/cover`,
              },
            }
          : {})}
      >
        {!game.thumbnail && (
          <span className="text-[24px] text-[var(--color)]">
            {game.name.charAt(0)}
          </span>
        )}
      </div>

      <span className="text-[16px] font-bold leading-[24px]">
        {t(`games.${game.slug}.name` as TranslationKey) || game.name}
      </span>

      {showDetails && (
        <div className="flex flex-col items-stretch gap-3 mt-2">
          <span className="text-[14px] text-[var(--textSecondary)] line-clamp-2">
            {t(`games.${game.slug}.description` as TranslationKey) ||
              game.description}
          </span>

          <div className="flex flex-row items-center flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 bg-[var(--backgroundFocus)] px-2 py-1 rounded-[12px] border border-[var(--borderColor)] text-[12px]">
              👥 {game.minPlayers}-{game.maxPlayers}
            </span>
            {game.estimatedDuration && (
              <span className="inline-flex items-center gap-1 bg-[var(--backgroundFocus)] px-2 py-1 rounded-[12px] border border-[var(--borderColor)] text-[12px]">
                ⏱️ {game.estimatedDuration}m
              </span>
            )}
            {game.complexity && (
              <span className="inline-flex items-center gap-1 bg-[var(--backgroundFocus)] px-2 py-1 rounded-[12px] border border-[var(--borderColor)] text-[12px]">
                🧠 {game.complexity}/5
              </span>
            )}
          </div>

          {game.tags && game.tags.length > 0 && (
            <div className="flex flex-row items-center flex-wrap gap-1">
              {game.tags.map((tag) => (
                <span
                  className="bg-[var(--backgroundHover)] px-2 py-1 rounded-[8px] border border-[var(--borderColor)] text-[12px] text-[var(--textSecondary)]"
                  key={tag}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </SharedCard>
  );
}

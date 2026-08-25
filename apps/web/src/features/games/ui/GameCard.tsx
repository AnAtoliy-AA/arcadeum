'use client';

import React from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
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

const Card = ({
  disabled = false,
  className,
  children,
  onClick,
}: {
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
}) => (
  <SharedCard
    className={cx(
      'transition-all duration-300 ease-out',
      disabled
        ? 'opacity-60 cursor-not-allowed'
        : 'cursor-pointer hover:-translate-y-[2px] hover:shadow-[0_0_25px_rgba(0,0,0,0.15)] hover:border-[var(--primary)] active:translate-y-0 active:scale-[0.98]',
      className,
    )}
    onClick={onClick}
  >
    {children}
  </SharedCard>
);

const CardGlow = ({ disabled = false }: { disabled?: boolean }) => (
  <div
    className={cx(
      'absolute top-0 left-0 right-0 h-[3px]',
      disabled
        ? 'bg-[var(--outlineColor)]'
        : 'bg-[linear-gradient(90deg,var(--primary),var(--secondary))]',
    )}
  />
);

const GameImage = ({
  background,
  children,
}: {
  background?: string;
  children?: ReactNode;
}) => (
  <div
    className={cx(
      'w-[60px] h-[60px] rounded-[8px] bg-[var(--backgroundFocus)] border-2 border-[var(--borderColor)] mb-3 flex items-center justify-center',
    )}
    style={background ? { background } : undefined}
  >
    {children}
  </div>
);

const MetaTag = ({ children }: { children?: ReactNode }) => (
  <div
    className={cx(
      'flex flex-row items-center gap-1 bg-[var(--backgroundFocus)] px-2 py-1 rounded-[12px] border border-[var(--borderColor)]',
    )}
  >
    {children}
  </div>
);

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
  const { t } = useTranslation();

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
    router.push(`/games/${game.slug}`);
  };

  return (
    <Card
      className={`p-4 ${className}`}
      onClick={handleClick}
      disabled={disabled}
    >
      <CardGlow disabled={disabled} />

      <div className="flex flex-row items-stretch absolute">
        <Badge variant={getStatusVariant(game.status)} size="sm">
          {game.status}
        </Badge>
      </div>

      <GameImage
        {...(game.thumbnail
          ? {
              background: `url(${game.thumbnail}) center/cover`,
            }
          : {})}
      >
        {!game.thumbnail && (
          <span className="text-[24px] text-[var(--color)]">
            {game.name.charAt(0)}
          </span>
        )}
      </GameImage>

      <span className="text-[20px] font-bold leading-[28px] text-[20px] font-semibold -mb-2">
        {t(`games.${game.slug}.name` as TranslationKey) || game.name}
      </span>

      {showDetails && (
        <div className="flex flex-col items-stretch gap-3">
          <span className="text-[16px] text-[var(--textSecondary)] line-clamp-2">
            {t(`games.${game.slug}.description` as TranslationKey) ||
              game.description}
          </span>

          <div className="flex flex-row items-stretch flex-wrap gap-2">
            <MetaTag>
              <span className="text-[12px]">
                👥 {game.minPlayers}-{game.maxPlayers}
              </span>
            </MetaTag>
            {game.estimatedDuration && (
              <MetaTag>
                <span className="text-[12px]">
                  ⏱️ {game.estimatedDuration}m
                </span>
              </MetaTag>
            )}
            {game.complexity && (
              <MetaTag>
                <span className="text-[12px]">🧠 {game.complexity}/5</span>
              </MetaTag>
            )}
          </div>

          {game.tags && game.tags.length > 0 && (
            <div className="flex flex-row items-stretch flex-wrap gap-1">
              {game.tags.map((tag) => (
                <div
                  className="flex flex-row items-stretch bg-[var(--backgroundHover)] px-2 py-1 rounded-[8px] border border-[var(--borderColor)]"
                  key={tag}
                >
                  <span className="text-[48px] text-[var(--textSecondary)]">
                    {tag}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

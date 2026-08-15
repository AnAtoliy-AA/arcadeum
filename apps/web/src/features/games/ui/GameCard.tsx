'use client';

import React from 'react';
import { styled, YStack, XStack } from 'tamagui';
import { useRouter } from 'next/navigation';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import type { GameMetadata } from '../types';
import { Card as SharedCard, Badge } from '@arcadeum/ui';

interface GameCardProps {
  game: GameMetadata;
  className?: string;
  onClick?: () => void;
  showDetails?: boolean;
  disabled?: boolean;
}

const StyledCard = styled(SharedCard, {
  name: 'GameCard',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: '$borderColor',

  hoverStyle: {
    y: -2,
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowRadius: 25,
    borderColor: '$primary',
  },

  pressStyle: {
    y: 0,
    scale: 0.98,
  },

  variants: {
    disabled: {
      true: {
        opacity: 0.6,
        cursor: 'not-allowed',
        hoverStyle: {
          y: 0,
          shadowRadius: 0,
          borderColor: '$borderColor',
        },
      },
    },
  } as const,
});

const CardGlow = styled(YStack, {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 3,
  variants: {
    disabled: {
      true: {
        backgroundColor: '$outlineColor',
      },
      false: {
        background: 'linear-gradient(90deg, $primary, $secondary)',
      },
    },
  } as const,
});

const GameImage = styled(YStack, {
  width: 60,
  height: 60,
  borderRadius: 8,
  backgroundColor: '$backgroundFocus',
  borderWidth: 2,
  borderColor: '$borderColor',
  marginBottom: '$3',
  alignItems: 'center',
  justifyContent: 'center',
});

const MetaTag = styled(XStack, {
  backgroundColor: '$backgroundFocus',
  paddingHorizontal: '$2',
  paddingVertical: '$1',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '$borderColor',
  alignItems: 'center',
  gap: '$1',
});

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
    <StyledCard
      className={`p-4 ${className}`}
      onClick={handleClick}
      disabled={disabled}
    >
      <CardGlow disabled={disabled} />

      <div className="box-border flex flex-row items-stretch absolute">
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
          <span className="box-border text-[24px] text-[var(--color)]">
            {game.name.charAt(0)}
          </span>
        )}
      </GameImage>

      <span className="box-border text-[20px] font-bold leading-[28px] text-[20px] font-semibold -mb-2">
        {t(`games.${game.slug}.name` as TranslationKey) || game.name}
      </span>

      {showDetails && (
        <div className="box-border flex flex-col items-stretch gap-3">
          <span className="box-border text-[16px] text-[var(--textSecondary)] line-clamp-2">
            {t(`games.${game.slug}.description` as TranslationKey) ||
              game.description}
          </span>

          <div className="box-border flex flex-row items-stretch flex-wrap gap-2">
            <MetaTag>
              <span className="box-border text-[12px]">
                👥 {game.minPlayers}-{game.maxPlayers}
              </span>
            </MetaTag>
            {game.estimatedDuration && (
              <MetaTag>
                <span className="box-border text-[12px]">
                  ⏱️ {game.estimatedDuration}m
                </span>
              </MetaTag>
            )}
            {game.complexity && (
              <MetaTag>
                <span className="box-border text-[12px]">
                  🧠 {game.complexity}/5
                </span>
              </MetaTag>
            )}
          </div>

          {game.tags && game.tags.length > 0 && (
            <div className="box-border flex flex-row items-stretch flex-wrap gap-1">
              {game.tags.map((tag) => (
                <div
                  className="box-border flex flex-row items-stretch bg-[var(--backgroundHover)] px-2 py-1 rounded-[8px] border border-[var(--borderColor)]"
                  key={tag}
                >
                  <span className="box-border text-[48px] text-[var(--textSecondary)]">
                    {tag}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </StyledCard>
  );
}

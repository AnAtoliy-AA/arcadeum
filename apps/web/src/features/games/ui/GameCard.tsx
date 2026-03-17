'use client';

import React from 'react';
import { styled, YStack, XStack, H3, Paragraph, Text } from 'tamagui';
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
      className={className}
      onClick={handleClick}
      disabled={disabled}
      padding="$4"
    >
      <CardGlow disabled={disabled} />

      <XStack position="absolute" top="$3" right="$3">
        <Badge variant={getStatusVariant(game.status)} size="sm">
          {game.status}
        </Badge>
      </XStack>

      <GameImage
        {...(game.thumbnail
          ? {
              background: `url(${game.thumbnail}) center/cover`,
            }
          : {})}
      >
        {!game.thumbnail && (
          <Text fontSize="$6" color="$color">
            {game.name.charAt(0)}
          </Text>
        )}
      </GameImage>

      <H3 fontSize="$5" fontWeight="600" marginBottom="$2">
        {t(`games.${game.slug}.name` as TranslationKey) || game.name}
      </H3>

      {showDetails && (
        <YStack gap="$3">
          <Paragraph fontSize="$3" color="$textSecondary" numberOfLines={2}>
            {t(`games.${game.slug}.description` as TranslationKey) ||
              game.description}
          </Paragraph>

          <XStack flexWrap="wrap" gap="$2">
            <MetaTag>
              <Text fontSize="$1">
                👥 {game.minPlayers}-{game.maxPlayers}
              </Text>
            </MetaTag>
            {game.estimatedDuration && (
              <MetaTag>
                <Text fontSize="$1">⏱️ {game.estimatedDuration}m</Text>
              </MetaTag>
            )}
            {game.complexity && (
              <MetaTag>
                <Text fontSize="$1">🧠 {game.complexity}/5</Text>
              </MetaTag>
            )}
          </XStack>

          {game.tags && game.tags.length > 0 && (
            <XStack flexWrap="wrap" gap="$1">
              {game.tags.map((tag) => (
                <XStack
                  key={tag}
                  backgroundColor="$backgroundHover"
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius={8}
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <Text fontSize={10} color="$textSecondary">
                    {tag}
                  </Text>
                </XStack>
              ))}
            </XStack>
          )}
        </YStack>
      )}
    </StyledCard>
  );
}

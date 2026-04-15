import { XStack, Text, styled } from 'tamagui';
import { memo } from 'react';

export type CosmeticBadgeProps = {
  badgeId: string;
};

const BADGE_CONFIG: Record<
  string,
  { emoji: string; gradient: string; glow: string }
> = {
  badge_social_butterfly: {
    emoji: '🦋',
    gradient: '$successGradient',
    glow: '$successBorder',
  },
  badge_legend_recruiter: {
    emoji: '👑',
    gradient: '$warningGradient',
    glow: '$warningBorder',
  },
};

const DEFAULT_BADGE = {
  emoji: '🏷️',
  gradient: '$infoGradient',
  glow: '$infoBorder',
};

const BADGE_LABELS: Record<string, string> = {
  badge_social_butterfly: 'Social Butterfly',
  badge_legend_recruiter: 'Legend Recruiter',
};

const BadgePill = styled(XStack, {
  name: 'CosmeticBadge',
  alignItems: 'center',
  paddingHorizontal: '$3',
  paddingVertical: '$3',
  borderRadius: 100,
  gap: '$1',

  variants: {
    badgeId: {
      ':string': (val) => {
        const config = BADGE_CONFIG[val] || DEFAULT_BADGE;
        return {
          background: config.gradient,
          shadowColor: config.glow,
          shadowRadius: 8,
          shadowOpacity: 0.5,
        };
      },
    },
  },
});

export const CosmeticBadge = memo(function CosmeticBadge({ badgeId }: CosmeticBadgeProps) {
  const config = BADGE_CONFIG[badgeId] ?? DEFAULT_BADGE;
  const label = BADGE_LABELS[badgeId] ?? badgeId;

  return (
    <BadgePill badgeId={badgeId} data-testid={`cosmetic-badge-${badgeId}`}>
      <Text fontSize="$1">{config.emoji}</Text>
      <Text fontSize="$1" fontWeight="700" color="white">
        {label}
      </Text>
    </BadgePill>
  );
});

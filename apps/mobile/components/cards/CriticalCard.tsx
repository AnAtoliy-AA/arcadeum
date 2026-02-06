import { memo } from 'react';
import { Platform } from 'react-native';
import { CriticalSpriteCard } from './CriticalSpriteCard';
import type { CriticalCard as CriticalCardType } from '@/pages/GamesScreen/components/CriticalTable/types';
import { SvgProps } from 'react-native-svg';

export type CardKey = CriticalCardType;

type CriticalCardProps = SvgProps & {
  card: CardKey | CriticalCardType;
  variant?: 1 | 2 | 3;
  gameVariant?: string;
  accessibilityLabel?: string;
};

export const CriticalCard = memo(
  ({
    card,
    variant = 1,
    gameVariant,
    accessibilityLabel,
    accessibilityRole,
    accessible,
    ...svgProps
  }: CriticalCardProps) => {
    const isAccessibilityDisabled = accessible === false;
    const normalizedAccessible =
      Platform.OS === 'web' && isAccessibilityDisabled ? undefined : accessible;

    const role = isAccessibilityDisabled
      ? undefined
      : (accessibilityRole ?? 'image');
    const label = isAccessibilityDisabled
      ? undefined
      : (accessibilityLabel ?? `${card} card`);

    // Default to cyberpunk if no variant is provided
    const activeVariant = gameVariant || 'cyberpunk';

    return (
      <CriticalSpriteCard
        card={card as CriticalCardType}
        variant={activeVariant}
        width={svgProps.width as number}
        height={svgProps.height as number}
        accessibilityLabel={label}
        accessibilityRole={role}
        accessible={normalizedAccessible}
      />
    );
  },
);

CriticalCard.displayName = 'CriticalCard';

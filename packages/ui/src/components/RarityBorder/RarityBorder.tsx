'use client';

import { YStack, styled } from 'tamagui';
import { memo } from 'react';
import type { ComponentProps, ReactElement, ReactNode } from 'react';

export type ShopRarity = 'common' | 'rare' | 'epic' | 'legendary';

const RARITY_BORDER: Record<ShopRarity, string> = {
  common: '$gray7',
  rare: '$blue8',
  epic: '$purple8',
  legendary: '$yellow8',
};

const RARITY_GLOW: Record<ShopRarity, string> = {
  common: 'transparent',
  rare: '$blue8',
  epic: '$purple8',
  legendary: '$yellow8',
};

const StyledRarityBorder = styled(YStack, {
  name: 'RarityBorder',
  borderWidth: 2,
  borderRadius: '$4',
  padding: '$2',
  shadowOpacity: 0.4,
  shadowRadius: 12,

  variants: {
    rarity: {
      common: {
        borderColor: RARITY_BORDER.common,
        shadowColor: RARITY_GLOW.common,
      },
      rare: {
        borderColor: RARITY_BORDER.rare,
        shadowColor: RARITY_GLOW.rare,
      },
      epic: {
        borderColor: RARITY_BORDER.epic,
        shadowColor: RARITY_GLOW.epic,
      },
      legendary: {
        borderColor: RARITY_BORDER.legendary,
        shadowColor: RARITY_GLOW.legendary,
      },
    },
  } as const,

  defaultVariants: {
    rarity: 'common',
  },
});

export type RarityBorderProps = ComponentProps<typeof StyledRarityBorder> & {
  rarity: ShopRarity;
  children: ReactNode;
};

export const RarityBorder = memo(function RarityBorder({
  rarity,
  children,
  ...rest
}: RarityBorderProps): ReactElement {
  return (
    <StyledRarityBorder rarity={rarity} {...rest}>
      {children}
    </StyledRarityBorder>
  );
});

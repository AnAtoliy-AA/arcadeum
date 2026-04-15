import { YStack, XStack, styled, GetProps } from 'tamagui';
import { memo } from 'react';
import type { ReactNode, ReactElement } from 'react';
import { GameVariant } from './GameContainer';

export type GameHeaderProps = GetProps<typeof XStack> & {
  variant?: GameVariant;
};

export const GameHeader = styled(XStack, {
  name: 'GameHeader',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '$4',
  padding: '$4',
  backgroundColor: '$glassBg',
  backdropFilter: 'blur(16px)',
  borderBottomWidth: 1,
  borderBottomColor: '$glassBorder',
  zIndex: 30,
  flexShrink: 0,

  variants: {
    variant: {
      cyberpunk: {
        borderBottomColor: '$cyberpunkPrimary',
      },
      underwater: {
        borderBottomColor: '$underwaterPrimary',
      },
      crime: {
        borderBottomColor: '$crimePrimary',
      },
      horror: {
        borderBottomColor: '$horrorPrimary',
      },
      adventure: {
        borderBottomColor: '$adventurePrimary',
      },
      'high-altitude-hike': {
        borderBottomColor: '$hikePrimary',
      },
    },
  } as const,
});

export const GameBoard = styled(YStack, {
  name: 'GameBoard',
  flex: 1,
  position: 'relative',
  padding: '$4',
  overflow: 'hidden',
  zIndex: 1,
});

export const TableArea = styled(XStack, {
  name: 'TableArea',
  flex: 1,
  position: 'relative',
  gap: '$4',
  height: '100%',
});

export const GameTitle = styled(YStack, {
  name: 'GameTitle',
  gap: '$1',

  variants: {
    variant: {
      cyberpunk: {
        color: '$cyberpunkPrimary',
      },
      underwater: {
        color: '$underwaterPrimary',
      },
      crime: {
        color: '$crimePrimary',
      },
      horror: {
        color: '$horrorPrimary',
      },
      adventure: {
        color: '$adventurePrimary',
      },
      'high-altitude-hike': {
        color: '$hikePrimary',
      },
    },
  } as const,
});

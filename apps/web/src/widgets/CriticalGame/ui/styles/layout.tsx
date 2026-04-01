import { styled, YStack } from 'tamagui';
import {
  GameContainer as BaseGameContainer,
  GameBoard as BaseGameBoard,
  TableArea as BaseTableArea,
} from '@arcadeum/ui';
import { getVariantStyles } from './variants';
import { TamaguiTheme } from './variants/types';

export const GameContainer = styled(BaseGameContainer, {
  name: 'GameContainer',
  gap: '$5',
  padding: '$7',
  borderRadius: 24,
  minHeight: 600,
  position: 'relative',
  overflow: 'hidden',
  backdropFilter: 'blur(20px)',
  height: '100%',

  $sm: {
    padding: '$2',
    borderRadius: 16,
    overflowY: 'auto',
  },

  variants: {
    $isMyTurn: {
      true: {
        // We handle the pulse animation via a prop or in tamagui.config.ts
      },
    },
    isFullscreen: {
      true: {
        maxWidth: '100vw',
        maxHeight: '100vh',
        width: '100vw',
        height: '100vh',
        borderRadius: 0,
        borderWidth: 0,
      },
    },
    $variant: (
      val: string,
      { props, theme }: { props: { $isMyTurn?: boolean }; theme: TamaguiTheme },
    ) => {
      const config = getVariantStyles(val).layout;
      const isMyTurn = props.$isMyTurn;

      return {
        backgroundColor: config.getRoomBackground(
          theme.background?.val || '',
          (theme.cardBackground || theme.background)?.val || '',
        ),
        borderWidth: isMyTurn ? 2 : 1,
        borderColor: config.getRoomBorder(
          !!isMyTurn,
          theme.borderColor?.val || '',
        ),
        shadowColor: config.getRoomShadow(!!isMyTurn),
        ...config.getBackgroundEffects(),
      };
    },
  } as const,
});

export const GameBoard = styled(BaseGameBoard, {
  name: 'GameBoard',
  gap: '$4',
  zIndex: 20,
  overflowY: 'auto',
  minHeight: 0,

  variants: {
    $variant: (_val: unknown) => ({}),
  } as const,
});

export const TableArea = styled(BaseTableArea, {
  name: 'TableArea',
  flex: 1,
  gap: '$4',
  flexDirection: 'column',

  variants: {
    $variant: (_val: unknown) => ({}),
  } as const,
});

export const HandSection = styled(YStack, {
  name: 'HandSection',
  gap: '$4',
  width: '100%',
  flexShrink: 0,
  zIndex: 30,

  variants: {
    $variant: (_val: unknown) => ({}),
  } as const,
});

export const HandContainer = styled(YStack, {
  name: 'HandContainer',
  gap: '$4',

  variants: {
    $variant: (_val: unknown) => ({}),
  } as const,
});

export const FrostyVignette = styled(YStack, {
  name: 'FrostyVignette',
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 5,
  borderRadius: 20,
  background:
    'radial-gradient(circle at center, transparent 50%, rgba(255, 255, 255, 0.02) 70%, rgba(125, 211, 252, 0.08) 100%)',
});

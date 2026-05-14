import { styled, YStack } from 'tamagui';
import {
  GameContainer as BaseGameContainer,
  GameBoard as BaseGameBoard,
  TableArea as BaseTableArea,
} from '@arcadeum/ui';
import { getVariantStyles } from './variants';
import { TamaguiTheme } from './variants/types';
import { scrollbarStyles } from '@/shared/lib/styles';

export const GameContainer = styled(BaseGameContainer, {
  name: 'GameContainer',
  gap: '$5',
  paddingHorizontal: '$7',
  paddingTop: '$7',
  paddingBottom: 0,
  borderRadius: 24,
  flex: 1,
  minHeight: 0,
  position: 'relative',
  overflowX: 'hidden',
  overflowY: 'auto',

  backdropFilter: 'blur(20px)',
  height: '100%',
  flexDirection: 'column',
  minWidth: 0,

  ...scrollbarStyles,

  $sm: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    borderRadius: 16,
    gap: '$2',
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
  flexDirection: 'column',
  position: 'relative',
  width: '100%',
  flexGrow: 0,
  flexShrink: 0,
  flexBasis: 'auto',

  $sm: {
    gap: '$2',
    padding: 0,
  },

  variants: {
    $variant: (_val: unknown) => ({}),
  } as const,
});

export const TableArea = styled(BaseTableArea, {
  name: 'TableArea',
  gap: '$4',
  flexDirection: 'column',
  minHeight: 0,
  position: 'relative',
  zIndex: 1,
  width: '100%',
  flexGrow: 0,
  flexShrink: 0,
  flexBasis: 'auto',
  height: 'auto',

  variants: {
    $variant: (_val: unknown) => ({}),
  } as const,
});

/**
 * Widget-mode grid: 3-row stack (opponents · arena · hand) with a max
 * width and explicit gutters. Replaces the legacy `GameBoard` wrapper
 * for `MatchWidget` so the rows don't span full bleed and the hand
 * stays clear of the screen edges on wide monitors.
 *
 * `paddingBottom` on `$sm` reserves room for the sticky `MobileHandBar`
 * which is portaled to body and thus outside this grid's flow.
 */
export const MatchWidgetGrid = styled(YStack, {
  name: 'MatchWidgetGrid',
  width: '100%',
  maxWidth: 1240,
  marginHorizontal: 'auto',
  paddingHorizontal: '$3',
  paddingVertical: '$3',
  gap: '$3',

  $sm: {
    paddingHorizontal: '$2',
    gap: '$2',
    paddingBottom: 120,
  },
});

export const HandSection = styled(YStack, {
  name: 'HandSection',
  gap: '$4',
  width: '100%',
  flexShrink: 0,
  zIndex: 30,
  position: 'relative',
  borderTopWidth: 1,
  borderTopColor: '$borderColor',
  paddingTop: '$4',

  $sm: {
    borderTopWidth: 0,
    paddingTop: 0,
    gap: '$2',
  },

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

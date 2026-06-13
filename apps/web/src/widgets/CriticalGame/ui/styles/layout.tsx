import { styled, YStack } from 'tamagui';
import {
  GameBoard as BaseGameBoard,
  TableArea as BaseTableArea,
} from '@arcadeum/ui';

// NOTE: the old `GameContainer` styled wrapper was removed when Critical
// adopted the shared `GameWidgetContainer` (header / fullscreen / chat popup /
// my-turn border now live in the shared shell). The per-variant room
// background it carried is handled by the shared shell + `SceneBackdrop`.

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
// §3.3 — `maxWidth` is the upper bound; the actual constraint is the
// `min(1240px, calc(100vw - 48px))` rule in hudStyles.tsx keyed off
// `[data-testid="match-widget-grid"]`. Tamagui's styled prop only
// accepts numeric pixel values, hence the split — keep this number in
// sync with the CSS rule if it ever changes. The same selector also
// sets `container-type: inline-size` so `.match-arena` can respond to
// SLOT width via @container queries.
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

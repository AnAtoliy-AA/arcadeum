import { styled, XStack, YStack, Text } from 'tamagui';

// CSS Grid wrapper — 10×10 grid that reliably computes its own height.
// Accepts the same theme props (backgroundColor, borderColor) as inline styles.

export const BoardGrid = styled(YStack, {
  name: 'BoardGrid',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  display: 'grid' as any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gridTemplateColumns: 'repeat(10, 1fr)' as any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gridTemplateRows: 'repeat(10, 1fr)' as any,
  aspectRatio: '1',
  padding: 4,
  width: '100%',
  overflow: 'hidden',
  boxSizing: 'border-box',
  pointerEvents: 'auto',
});

// State-aware coloring is done inline by the component via useSeaBattleTheme()
export const BoardCell = styled(YStack, {
  name: 'BoardCell',

  variants: {
    isClickable: {
      true: { cursor: 'crosshair' },
      false: { cursor: 'default' },
    },
    animated: {
      true: { animation: 'medium' },
    },
  } as const,

  defaultVariants: {
    animated: false,
  },
  pointerEvents: 'auto',
  userSelect: 'none',
});

// CSS Grid layout: [empty corner] [col labels]
// [row labels ] [board grid ]
export const BoardWithLabels = styled(YStack, {
  name: 'BoardWithLabels',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  display: 'grid' as any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gridTemplateColumns: 'auto 1fr' as any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gridTemplateRows: 'auto auto' as any,
  gap: 2,
  width: '100%',
  maxWidth: '100%',
});

export const RowLabels = styled(YStack, {
  name: 'RowLabels',
  justifyContent: 'space-around',
  paddingVertical: 2,
});

export const ColLabels = styled(XStack, {
  name: 'ColLabels',
  justifyContent: 'space-around',
  paddingHorizontal: 2,
});

export const Label = styled(Text, {
  name: 'Label',
  fontSize: 12,
  width: 20,
  height: 20,
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0.6,

  $md: {
    fontSize: 11,
    width: 18,
    height: 18,
  },

  $sm: {
    fontSize: 8,
    width: 12,
    height: 12,
  },
  $short: {
    fontSize: 8,
    width: 10,
    height: 10,
  },
});

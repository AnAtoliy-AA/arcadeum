import { styled, XStack, YStack, Text, GetProps } from 'tamagui';
import type { CSSProperties } from 'react';

// CSS Grid wrapper — 10×10 grid that reliably computes its own height.
// Accepts the same theme props (backgroundColor, borderColor) as inline styles.

const BoardGridContainer = styled(YStack, {
  name: 'BoardGridContainer',
  aspectRatio: '1',
  padding: 4,
  width: '100%',
  overflow: 'hidden',
  boxSizing: 'border-box',
  pointerEvents: 'auto',
});

export type BoardGridProps = GetProps<typeof BoardGridContainer>;

export const BoardGrid = (props: BoardGridProps) => (
  <BoardGridContainer
    {...props}
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(10, 1fr)',
      gridTemplateRows: 'repeat(10, 1fr)',
      ...(props.style as any),
    }}
  />
);

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
const BoardWithLabelsContainer = styled(YStack, {
  name: 'BoardWithLabelsContainer',
  gap: 2,
  width: '100%',
  maxWidth: '100%',
});

export type BoardWithLabelsProps = GetProps<typeof BoardWithLabelsContainer>;

export const BoardWithLabels = (props: BoardWithLabelsProps) => (
  <BoardWithLabelsContainer
    {...props}
    style={{
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
      gridTemplateRows: 'auto auto',
      ...(props.style as any),
    }}
  />
);

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

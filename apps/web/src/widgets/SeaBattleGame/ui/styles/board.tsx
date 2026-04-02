import { styled, XStack, YStack, Text } from 'tamagui';
import type { ReactNode } from 'react';

// Structure only — pass backgroundColor, borderColor, borderRadius as inline props
// from consuming components that call useSeaBattleTheme()
export const BoardGrid = styled(YStack, {
  name: 'BoardGrid',
  flexDirection: 'row',
  flexWrap: 'wrap',
  padding: 4,
  width: '100%',
  maxWidth: 400,
  aspectRatio: 1,
  overflow: 'visible',

  $md: {
    maxWidth: '100%',
  },

  $sm: {
    padding: 2,
  },
  pointerEvents: 'auto',
});

// State-aware coloring is done inline by the component via useSeaBattleTheme()
export const BoardCell = styled(YStack, {
  name: 'BoardCell',
  width: '10%',
  aspectRatio: 1,

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
//                  [row labels  ] [board grid ]
export function BoardWithLabels({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gridTemplateRows: 'auto 1fr',
        gap: '4px',
        width: '100%',
        maxWidth: 400,
      }}
    >
      {children}
    </div>
  );
}

export const RowLabels = styled(YStack, {
  name: 'RowLabels',
  justifyContent: 'space-around',
  paddingVertical: 4,
});

export const ColLabels = styled(XStack, {
  name: 'ColLabels',
  justifyContent: 'space-around',
  paddingHorizontal: 4,
});

export const Label = styled(Text, {
  name: 'Label',
  fontSize: 12,
  width: 20,
  height: 20,
  textAlign: 'center',

  $md: {
    fontSize: 14,
    width: 25,
    height: 25,
  },

  $sm: {
    fontSize: 10,
    width: 16,
    height: 16,
  },
});

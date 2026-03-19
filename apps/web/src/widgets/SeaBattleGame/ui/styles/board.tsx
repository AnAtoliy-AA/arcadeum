import { styled, XStack, YStack, Text } from 'tamagui';

// Structure only — pass backgroundColor, borderColor, borderRadius as inline props
// from consuming components that call useSeaBattleTheme()
export const BoardGrid = styled(YStack, {
  name: 'BoardGrid',
  flexDirection: 'row',
  flexWrap: 'wrap',
  padding: 4,
  maxWidth: 400,
  aspectRatio: 1,

  $md: {
    maxWidth: '100%',
    width: '100%',
  },

  $sm: {
    padding: 2,
  },
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
    animated: true,
  },
});

export const BoardWithLabels = styled(XStack, {
  name: 'BoardWithLabels',
  flexWrap: 'wrap',
  gap: 4,

  $sm: {
    gap: 2,
    width: '100%',
  },
});

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

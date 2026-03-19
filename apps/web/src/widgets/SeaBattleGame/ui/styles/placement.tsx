import { styled, XStack, YStack, Text } from 'tamagui';

export const ShipPalette = styled(YStack, {
  name: 'ShipPalette',
  gap: '$2',
  padding: '$4',

  $md: {
    flexDirection: 'row',
    overflowX: 'scroll' as any,
    padding: '$4',
    gap: '$6',
    width: '100%',
  },
});

// Border/bg colors passed as inline props from useSeaBattleTheme()
export const ShipItem = styled(XStack, {
  name: 'ShipItem',
  alignItems: 'center',
  gap: '$2',
  paddingHorizontal: '$3',
  paddingVertical: '$2',
  borderWidth: 1,
  borderRadius: 8,

  variants: {
    isPlaced: {
      true: { opacity: 0.5, cursor: 'default' },
      false: { cursor: 'pointer' },
    },
  } as const,

  $sm: {
    flexShrink: 0,
  },
});

export const ShipPreview = styled(XStack, {
  name: 'ShipPreview',
  gap: 2,
});

// Pass backgroundColor, borderColor inline from useSeaBattleTheme()
export const ShipCell = styled(YStack, {
  name: 'ShipCell',
  width: 16,
  height: 16,
  borderRadius: 2,
  borderWidth: 1,
});

export const ShipName = styled(Text, {
  name: 'ShipName',
  fontSize: 14,
  flex: 1,
});

export const PlacementActions = styled(YStack, {
  name: 'PlacementActions',
  gap: '$2',
  width: '100%',

  $sm: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: '$2',
  },
});

export const RotateButton = styled(YStack, {
  name: 'RotateButton',
  paddingHorizontal: '$4',
  paddingVertical: '$2',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderWidth: 1,
  borderRadius: 4,
  cursor: 'pointer',

  $sm: {
    flex: 1,
    minWidth: 120,
    paddingVertical: '$2',
    paddingHorizontal: '$4',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
});

export const ActionButton = styled(YStack, {
  name: 'ActionButton',
  paddingHorizontal: '$6',
  paddingVertical: '$3',
  borderRadius: 8,
  cursor: 'pointer',
  alignItems: 'center',
  justifyContent: 'center',

  variants: {
    $variant: {
      primary: {
        backgroundColor: '$primary',
      },
      secondary: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      },
    },
    disabled: {
      true: { opacity: 0.5, cursor: 'not-allowed' },
    },
  } as const,

  $sm: {
    paddingVertical: '$2',
    paddingHorizontal: '$4',
    flex: 1,
    minWidth: 120,
  },
});

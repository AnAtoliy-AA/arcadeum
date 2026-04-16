import { styled, XStack, YStack, Text } from 'tamagui';
import { Button } from '@arcadeum/ui';

export const ShipPalette = styled(YStack, {
  name: 'ShipPalette',
  gap: '$2',
  padding: '$4',
  alignItems: 'center',

  $md: {
    flexDirection: 'row',
    overflowX: 'auto',
    padding: '$2',
    gap: '$2',
    width: '100%',
    alignItems: 'center',
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
  maxWidth: 240,
  width: '100%',

  variants: {
    isPlaced: {
      true: { opacity: 0.5, cursor: 'default' },
      false: { cursor: 'grab' },
    },
    animated: {
      true: { animation: 'medium' },
    },
  } as const,

  defaultVariants: {
    animated: false,
  },

  $md: {
    flexShrink: 0,
    width: 'auto',
    paddingHorizontal: '$2',
    paddingVertical: '$1',
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

  $md: {
    fontSize: 12,
  },
});

export const PlacementActions = styled(YStack, {
  name: 'PlacementActions',
  gap: '$2',
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: '$2',
  paddingVertical: '$2',
  flexDirection: 'row',
  flexWrap: 'wrap',

  $gtMd: {
    gap: '$3',
    paddingHorizontal: '$4',
    paddingVertical: '$4',
  },
});

// Re-export Button as ActionButton and RotateButton for call sites that import by name
export { Button as ActionButton, Button as RotateButton };

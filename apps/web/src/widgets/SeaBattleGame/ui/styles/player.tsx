import { styled, XStack, YStack, Text } from 'tamagui';

// Border/bg colors passed as inline props from components using useSeaBattleTheme()
export const PlayerSection = styled(YStack, {
  name: 'PlayerSection',
  alignItems: 'center',
  gap: '$2',
  padding: '$4',
  borderWidth: 2,
  borderRadius: 12,

  variants: {
    isTargetable: {
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

  $md: {
    padding: '$4',
    gap: '$3',
    alignItems: 'center',
    width: '100%',
    maxWidth: 600,
  },
  $sm: {
    padding: '$3',
    gap: '$2',
    alignItems: 'center',
    width: '100%',
    marginBottom: '$5',
  },
});

export const BadgeWrapper = styled(XStack, {
  name: 'BadgeWrapper',
  position: 'absolute',
  top: -12,
  zIndex: 10,
  left: '50%',
  transform: [{ translateX: '-50%' }],
});

export const PlayerName = styled(Text, {
  name: 'PlayerName',
  margin: 0,
  fontSize: 16,
  fontWeight: '500',
});

export const PlayerStats = styled(YStack, {
  name: 'PlayerStats',
  // @ts-expect-error — fontSize cascades to child Text nodes
  fontSize: 14,
});

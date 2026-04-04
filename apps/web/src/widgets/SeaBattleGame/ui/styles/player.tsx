import { styled, XStack, YStack, Text } from 'tamagui';

export const PlayerSection = styled(YStack, {
  name: 'PlayerSection',
  alignItems: 'center',
  gap: '$2',
  padding: '$4',
  borderWidth: 2,
  borderRadius: 12,
  minWidth: 0,
  width: '100%',
  overflow: 'hidden',

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

  $sm: {
    padding: '$3',
    gap: '$2',
  },
});

// Narrow (≤1150px): full-width block, stacked vertically by parent column layout.
// Wide (>1150px): flex:1 side-by-side row, capped at 440px.
export const PlayerSectionWrapper = styled(YStack, {
  name: 'PlayerSectionWrapper',
  position: 'relative',
  overflow: 'visible',
  paddingTop: 12,
  width: '100%',
  maxWidth: 500,
  alignSelf: 'center',

  $gtMd: {
    width: 'auto',
    alignSelf: 'auto',
    flex: 1,
    maxWidth: 'min(600px, calc(100vh - 430px))',
  },
});

export const BadgeWrapper = styled(XStack, {
  name: 'BadgeWrapper',
  position: 'absolute',
  top: 0,
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

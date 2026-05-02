import { styled, XStack, YStack, Text } from 'tamagui';

export const PlayerSection = styled(YStack, {
  name: 'PlayerSection',
  alignItems: 'center',
  gap: '$1.5',
  padding: '$3',
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

  $md: {
    padding: '$2',
    gap: '$1',
  },
  $sm: {
    padding: '$1',
    gap: 2,
    borderRadius: 8,
  },
  $short: {
    padding: '$1',
    gap: 1,
  },
});

// Narrow (≤1150px): full-width block, stacked vertically by parent column layout.
// Wide (>1150px): flex:1 side-by-side row, capped at 440px.
export const PlayerSectionWrapper = styled(YStack, {
  name: 'PlayerSectionWrapper',
  position: 'relative',
  overflow: 'visible',
  paddingTop: 8,
  width: '100%',
  maxWidth: 480,
  alignSelf: 'center',

  $gtMd: {
    paddingTop: 10,
    width: 'auto',
    alignSelf: 'auto',
    flex: 1,
    maxWidth: 'min(480px, calc(100vh - 380px))',
    minWidth: 300,
  },
  $sm: {
    paddingTop: 6,
    maxWidth: 'none',
  },
  $short: {
    paddingTop: 4,
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
  fontSize: 15,
  fontWeight: '600',

  $sm: {
    fontSize: 13,
  },
});

export const PlayerStats = styled(YStack, {
  name: 'PlayerStats',
  // @ts-expect-error — fontSize cascades to child Text nodes
  fontSize: 14,
});

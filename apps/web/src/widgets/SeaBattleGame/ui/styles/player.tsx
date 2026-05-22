import { styled, XStack, YStack, Text } from 'tamagui';

export const PlayerSection = styled(YStack, {
  name: 'PlayerSection',
  alignItems: 'stretch',
  gap: '$1.5',
  padding: '$3',
  borderWidth: 2,
  borderRadius: 12,
  minWidth: 0,
  minHeight: 0,
  width: '100%',
  // When the wrapper provides a definite height (multi-board grid mode),
  // fill it so the BoardWithLabels child can take the remaining space via
  // its grid 1fr row. In single-board / unconstrained contexts (placement
  // screen), height:100% collapses to auto, preserving prior behavior.
  height: '100%',
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

// Fills its parent grid cell so the contained board can fit-to-height via
// CSS (1fr rows on the grid + aspect-ratio on the board). Width-cap is
// dropped — the grid template now governs per-column width.
export const PlayerSectionWrapper = styled(YStack, {
  name: 'PlayerSectionWrapper',
  position: 'relative',
  overflow: 'visible',
  paddingTop: 8,
  width: '100%',
  height: '100%',
  minHeight: 0,
  minWidth: 0,

  $sm: {
    paddingTop: 6,
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
  textAlign: 'center',

  $sm: {
    fontSize: 13,
  },
});

export const PlayerStats = styled(YStack, {
  name: 'PlayerStats',
  width: '100%',
  // @ts-expect-error — fontSize cascades to child Text nodes
  fontSize: 14,
});

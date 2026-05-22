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

// Natural-height wrapper. In fit-grid mode the `.sb-fit-grid > *` CSS
// rule stretches it to fill its grid cell; in mobile vertical (1-col flex
// column) we leave it at content height so the page scrolls naturally
// between boards instead of each board taking the full viewport height.
export const PlayerSectionWrapper = styled(YStack, {
  name: 'PlayerSectionWrapper',
  position: 'relative',
  overflow: 'visible',
  paddingTop: 8,
  width: '100%',
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

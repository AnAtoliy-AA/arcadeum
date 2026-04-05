import { styled, YStack, XStack } from 'tamagui';
import { getVariantStyles } from './variants';

export const GameTable = styled(YStack, {
  name: 'GameTable',
  gap: '$6',
  alignItems: 'center',
  justifyContent: 'flex-start',
  paddingTop: '$9',
  paddingBottom: '$4',
  paddingHorizontal: '$7',
  position: 'relative',
  width: '100%',
  flex: 1,
  minHeight: 500, // Increased from 420

  $sm: {
    paddingTop: '$9',
    paddingBottom: '$4',
    paddingHorizontal: '$2',
    minHeight: 360,
  },

  variants: {
    $variant: (_val: unknown) => ({}),
  } as const,
});

export const TableBackground = styled(YStack, {
  name: 'TableBackground',
  position: 'absolute',
  inset: 0,
  borderRadius: 20,
  overflow: 'hidden',
  zIndex: 0,

  variants: {
    $variant: (val: string) => {
      const config = getVariantStyles(val).table;
      return {
        backgroundColor: config.getBackground(),
        borderColor: config.getBorder(),
        borderWidth: 1,
        shadowColor: config.getShadow(),
        shadowRadius: 15,
        shadowOpacity: 0.2,
      };
    },
  } as const,

  $sm: {
    borderRadius: 14,
  },
});

export const PlayersRing = styled(XStack, {
  name: 'PlayersRing',
  position: 'relative',
  width: '100%',
  flex: 1,
  minHeight: 450, // Increased from 320
  alignItems: 'center',
  justifyContent: 'center',

  $sm: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'auto',
    gap: '$2',
    padding: '$2',
    flex: 0,
    flexShrink: 0,
  },

  variants: {
    $variant: (_val: unknown) => ({}),
  } as const,
});

export const PlayerPositionWrapper = styled(YStack, {
  name: 'PlayerPositionWrapper',
  position: 'absolute',
  zIndex: 5,

  $sm: {
    position: 'relative',
    transform: 'none',
    width: '48%',
    alignItems: 'center',
  },

  variants: {
    $variant: (_val: unknown) => ({}),
  } as const,
});

export const CardSlot = styled(YStack, {
  name: 'CardSlot',
  width: 75,
  height: 112,
  position: 'relative',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2,

  $sm: {
    width: 55,
    height: 82,
  },

  variants: {
    $variant: (_val: unknown) => ({}),
  } as const,
});

export const CenterTable = styled(XStack, {
  name: 'CenterTable',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$6',
  padding: '$4',
  borderRadius: 1000, // Circular
  width: 240,
  height: 240,
  position: 'relative',
  zIndex: 1,

  variants: {
    $variant: (val: string) => {
      const config = getVariantStyles(val).table.center;
      return {
        backgroundColor: config.getBackground(),
        borderColor: config.getBorder(),
        borderWidth: 1,
        shadowColor: config.getGlow(),
        shadowRadius: 20,
        shadowOpacity: 0.3,
      };
    },
  } as const,

  $sm: {
    width: 130,
    height: 130,
    padding: '$2',
    marginTop: -10,
  },
});

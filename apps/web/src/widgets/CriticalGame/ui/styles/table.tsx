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
  flexShrink: 0,
  minHeight: 500,
  overflow: 'hidden',

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
  position: 'relative',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2,

  variants: {
    $role: {
      deck: {
        width: 74,
        height: 102,
        $sm: { width: 58, height: 80 },
      },
      lastPlayed: {
        width: 92,
        height: 126,
        $sm: { width: 72, height: 100 },
      },
    },
    $variant: (_val: unknown) => ({}),
  } as const,
});

export const CenterTable = styled(XStack, {
  name: 'CenterTable',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 32,
  padding: '$4',
  borderRadius: 1000, // Circular
  width: 340,
  height: 340,
  position: 'relative',
  zIndex: 1,

  variants: {
    $variant: (val: string) => {
      const config = getVariantStyles(val).table.center;
      return {
        backgroundColor: config.getBackground(),
        borderColor: config.getBorder(),
        borderWidth: 2,
        shadowColor: config.getGlow(),
        shadowRadius: 40,
        shadowOpacity: 0.5,
        elevation: 10,
      };
    },
  } as const,

  $sm: {
    width: 220,
    height: 220,
    padding: '$2',
    marginTop: -10,
    gap: 14,
  },
});

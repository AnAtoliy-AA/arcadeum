import { styled, YStack, XStack, Text } from 'tamagui';
import { getVariantStyles } from './variants';

export const PlayerStatsContainer = styled(YStack, {
  name: 'PlayerStatsContainer',
  gap: '$1',
  alignItems: 'center',

  variants: {
    $variant: (_val: unknown) => ({}),
  } as const,
});

export const PlayerCardCount = styled(XStack, {
  name: 'PlayerCardCount',
  alignItems: 'center',
  gap: '$1',
  paddingVertical: '$1',
  paddingHorizontal: '$2',
  borderRadius: 100,
  backgroundColor: '$background',
  borderColor: '$borderColor',
  borderWidth: 1,

  variants: {
    $isCurrentTurn: {
      true: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderColor: 'rgba(255,255,255,0.4)',
      },
    },
    $type: {
      default: {},
      stash: {
        backgroundColor: '$stashBg',
        borderColor: '$stashBorder',
      },
      marked: {
        backgroundColor: '$markedBg',
        borderColor: '$markedBorder',
      },
    },
    $variant: (
      val: string,
      {
        props,
      }: {
        props: {
          $isCurrentTurn?: boolean;
          $type?: 'default' | 'stash' | 'marked';
        };
      },
    ) => {
      const config = getVariantStyles(val).players;
      return {
        ...config.getCardCountStyles?.(props.$isCurrentTurn, props.$type),
      };
    },
  } as const,

  $sm: {
    paddingVertical: '$1',
    paddingHorizontal: '$1.5',
  },
});

export const TurnIndicator = styled(Text, {
  name: 'TurnIndicator',
  position: 'relative',
  marginBottom: -10,
  width: 28,
  height: 28,
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 20,

  variants: {
    $variant: (val: string) => {
      const config = getVariantStyles(val).players;
      return {
        textShadowColor: config.getTurnIndicatorGlow(),
        ...config.getTurnIndicatorStyles?.(),
      };
    },
  } as const,
});

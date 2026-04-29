import { styled, YStack, Text } from 'tamagui';
import { getVariantStyles } from './variants';
import { TamaguiTheme } from './variants/types';

export const PlayerCard = styled(YStack, {
  name: 'PlayerCard',
  position: 'relative',
  alignItems: 'center',
  justifyContent: 'center',
  variants: {
    $animate: {
      true: {},
    },
    $isCurrentTurn: {
      true: {},
      false: {},
    },
    $isAlive: {
      true: {},
      false: {},
    },
    $isCurrentUser: {
      true: {},
      false: {},
    },
    $variant: (
      val: string,
      {
        props,
        theme,
      }: {
        props: {
          $isCurrentTurn?: boolean;
          $isCurrentUser?: boolean;
          $isAlive?: boolean;
        };
        theme: TamaguiTheme;
      },
    ) => {
      const config = getVariantStyles(val).players;
      return {
        backgroundColor: config.getCardBackground(
          props.$isCurrentTurn,
          props.$isCurrentUser,
          props.$isAlive,
          theme,
        ),
        borderColor: config.getCardBorder(
          props.$isCurrentTurn,
          props.$isCurrentUser,
        ),
        shadowColor: config.getCardShadow(
          props.$isCurrentTurn,
          props.$isCurrentUser,
        ),
        gap: config.getCardGap(),
        padding: config.getCardPadding(),
        borderRadius: config.getCardBorderRadius(),
        clipPath: config.getCardClipPath(),
        ...config.getCardDimensions(),
      };
    },
  } as const,

  $sm: {
    minWidth: 80,
    maxWidth: 100,
    padding: '$2',
    gap: '$1',
  },

  defaultVariants: {
    $animate: true,
  },
});

export const PlayerAvatar = styled(YStack, {
  name: 'PlayerAvatar',
  position: 'relative',
  borderWidth: 2,

  variants: {
    $animate: {
      true: {},
    },
    $isCurrentTurn: {
      true: {},
      false: {},
    },
    $isAlive: {
      true: {},
      false: {},
    },
    $variant: (
      val: string,
      {
        props,
        theme,
      }: { props: { $isCurrentTurn?: boolean }; theme: TamaguiTheme },
    ) => {
      const config = getVariantStyles(val).players;
      return {
        backgroundColor: config.getAvatarBackground(
          props.$isCurrentTurn,
          theme,
        ),
        borderColor: config.getAvatarBorder(props.$isCurrentTurn, theme),
        shadowColor: config.getAvatarShadow(!!props.$isCurrentTurn),
        ...config.getAvatarStyles?.(),
      };
    },
  } as const,

  defaultVariants: {
    $animate: true,
  },
});

export const AvatarRing = styled(YStack, {
  name: 'AvatarRing',
  position: 'absolute',
  inset: -4,
  borderRadius: 999,
  borderWidth: 2,
  zIndex: 1,

  variants: {
    $isMyTurn: {
      true: {
        animation: 'pulse 2s infinite',
      },
    },
    $variant: (
      val: string,
      {
        props,
      }: { props: { $isCurrentTurn?: boolean; $isEliminated?: boolean } },
    ) => {
      const config = getVariantStyles(val).players;
      return {
        border: config.getAvatarRing(
          !!props.$isCurrentTurn,
          !!props.$isEliminated,
        ),
      };
    },
  } as const,
});

export const PlayerName = styled(Text, {
  name: 'PlayerName',
  fontSize: 14,
  fontWeight: '600',
  color: '$color',
  textAlign: 'center',
  maxWidth: 120,

  $sm: {
    fontSize: 11,
    maxWidth: 70,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  variants: {
    $variant: (
      val: string,
      { props }: { props: { $isCurrentTurn?: boolean } },
    ) => {
      const config = getVariantStyles(val).players;
      return {
        textShadowColor: config.getNameShadow(!!props.$isCurrentTurn),
        ...config.getNameStyles?.(),
      };
    },
  } as const,
});

export const TurnIndicator = styled(YStack, {
  name: 'TurnIndicator',
  width: 12,
  height: 12,
  borderRadius: 6,
  display: 'flex',
  position: 'absolute',
  top: -4,
  right: -4,
  zIndex: 2,

  variants: {
    $variant: (val: string) => {
      const config = getVariantStyles(val).players;
      return {
        ...config.getTurnIndicatorStyles?.(),
      };
    },
  } as const,
});

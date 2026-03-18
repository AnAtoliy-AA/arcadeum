import { styled, XStack, Text } from 'tamagui';
import { Button, ButtonProps, GameVariant } from '@arcadeum/ui';
import { Card } from './cards-base';
import { getVariantStyles } from './variants';

export * from './cards-base';

export type ActionButtonProps = ButtonProps & {
  variant?: string;
  $variant?: string;
};

export const ActionButton = ({
  variant,
  $variant,
  ...props
}: ActionButtonProps) => (
  <Button
    variant={(variant || 'primary') as ButtonProps['variant']}
    size="md"
    gameVariant={(variant || $variant) as GameVariant}
    {...props}
  />
);

export const LastPlayedCard = styled(Card, {
  name: 'LastPlayedCard',
  position: 'absolute',
  width: '100%',
  height: '100%',
  left: 0,
  top: 0,
  zIndex: 10,
  elevation: 10,
  cursor: 'default',

  variants: {
    $isAnimating: {
      true: {
        rotateY: '180deg',
        scale: 1.1,
        // Animation handled via animation prop
      },
      false: {
        rotateY: '0deg',
      },
    },
    $variant: (val: string) => {
      const config = getVariantStyles(val).cards;
      return {
        boxShadow: config.glowEffect,
        borderColor: config.borderEffect,
        ...config.getCardStyles?.(),
      };
    },
  } as const,

  hoverStyle: {
    scale: 1.05,
  },
});

export const ActionButtons = styled(XStack, {
  name: 'ActionButtons',
  gap: '$3',
  flexWrap: 'wrap',
  zIndex: 50,

  variants: {
    $variant: (val: string) => {
      const config = getVariantStyles(val).cards;
      return {
        ...config.getActionButtonsStyles?.(),
      };
    },
  } as const,
});

export const CardsGrid = styled(XStack, {
  name: 'CardsGrid',
  flexWrap: 'wrap',
  gap: '$3',
  justifyContent: 'center',
  padding: '$2',

  variants: {
    $layout: {
      grid: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
      },
      'grid-3': {
        display: 'grid' as unknown as 'flex',
        gridTemplateColumns: 'repeat(3, 1fr)',
      },
      'grid-4': {
        display: 'grid' as unknown as 'flex',
        gridTemplateColumns: 'repeat(4, 1fr)',
      },
      'grid-5': {
        display: 'grid' as unknown as 'flex',
        gridTemplateColumns: 'repeat(5, 1fr)',
      },
      'grid-6': {
        display: 'grid' as unknown as 'flex',
        gridTemplateColumns: 'repeat(6, 1fr)',
      },
      linear: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        overflowX: 'auto',
        paddingBottom: '$2',
        justifyContent: 'flex-start',
        gap: '$2',
      },
      list: {
        flexDirection: 'column',
        gap: '$2',
      },
    },
    $variant: (_val: unknown) => ({}),
  } as const,
});

export const CardEmoji = styled(Text, {
  name: 'CardEmoji',
  fontSize: 40,
  lineHeight: 48,
  marginBottom: '$2',
  textAlign: 'center',

  $sm: {
    fontSize: 28,
    lineHeight: 34,
  },
});

export const DeckCard = styled(Card, {
  name: 'DeckCard',
  borderStyle: 'dashed',
  opacity: 0.8,
  backgroundColor: 'rgba(255, 255, 255, 0.05)',

  variants: {
    $variant: (val: string) => {
      const config = getVariantStyles(val).cards;
      return {
        borderColor: config.deckBorderColor,
        ...config.getDeckStyles?.(),
      };
    },
  } as const,

  hoverStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export const StashedCard = styled(Card, {
  name: 'StashedCard',
  borderColor: '$primary',
  borderWidth: 1,
  opacity: 0.9,

  variants: {
    $variant: (val: string) => {
      const config = getVariantStyles(val).cards;
      return {
        borderColor: config.deckBorderColor,
        ...config.getCardStyles?.(),
      };
    },
  } as const,
});

export const StashIcon = styled(Text, {
  name: 'StashIcon',
  position: 'absolute',
  top: '$2',
  right: '$2',
  fontSize: 12,
  opacity: 0.6,
});

import { YStack, styled, GetProps } from 'tamagui';
import { memo } from 'react';
import type { ReactNode, ReactElement } from 'react';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'glass' | 'error';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

const StyledCard = styled(YStack, {
  name: 'Card',
  borderRadius: '$5',
  position: 'relative',
  overflow: 'hidden',

  variants: {
    variant: {
      default: {
        backgroundColor: '$background',
        borderColor: '$borderColor',
        borderWidth: 1,
      },
      elevated: {
        backgroundColor: '$background',
        borderColor: '$borderColor',
        borderWidth: 1,
        elevation: '$medium',
      },
      outlined: {
        backgroundColor: 'transparent',
        borderColor: '$borderColor',
        borderWidth: 1,
        borderStyle: 'dashed',
      },
      glass: {
        backgroundColor: '$glassBg',
        borderColor: '$glassBorder',
        borderWidth: 1,
      },
      error: {
        backgroundColor: '$dangerBgSoft',
        borderColor: '$dangerBorder',
        borderWidth: 1,
        color: '$danger',
      },
    },
    cardPadding: {
      none: { padding: 0 },
      sm: { padding: '$3' },
      md: { padding: '$5' },
      lg: { padding: '$7' },
    },
    interactive: {
      true: {
        cursor: 'pointer',
        hoverStyle: {
          y: -6,
          borderColor: '$primary',
        },
        pressStyle: {
          scale: 0.98,
          y: -2,
        },
      },
    },
    animated: {
      true: {
        animation: 'medium',
      },
    },
  } as const,

  defaultVariants: {
    variant: 'elevated',
    cardPadding: 'md',
    animated: true,
  },
});

const TopLine = styled(YStack, {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 2,
  opacity: 0,
  background: 'linear-gradient(90deg, transparent, $primary, transparent)',
  scaleX: 0.5,

  variants: {
    visible: {
      true: {
        opacity: 1,
        scaleX: 1,
      },
    },
  } as const,
});

export type CardProps = GetProps<typeof StyledCard> & {
  variant?: CardVariant;
  padding?: CardPadding;
  interactive?: boolean;
  children?: ReactNode;
  group?: string | boolean;
  title?: string;
  /** @deprecated Use onClick instead */
  onPress?: () => void;
  onClick?: (e: unknown) => void;
};

interface CardInnerProps extends CardProps {
  isCurrent?: boolean;
  isHost?: boolean;
  isCurrentUserCard?: boolean;
  $isCurrent?: boolean;
  $isHost?: boolean;
  $isCurrentUser?: boolean;
  $variant?: string;
  $status?: string;
  [key: string]: unknown;
}

import { filterProps } from '../../utils/filterProps';

export const Card = StyledCard.styleable<CardProps>(
  (
    {
      variant = 'elevated',
      padding = 'md',
      interactive = false,
      children,
      onPress,
      onClick,
      ...rest
    }: CardInnerProps,
    ref,
  ) => {
    const filteredProps = filterProps({ ...rest, onPress, onClick });

    return (
      <StyledCard
        ref={ref}
        variant={variant}
        cardPadding={padding}
        interactive={interactive}
        {...filteredProps}
      >
        <TopLine visible={interactive} className="card-top-line" />
        {children}
      </StyledCard>
    );
  },
);

Card.displayName = 'Card';

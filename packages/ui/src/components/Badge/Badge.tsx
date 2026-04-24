import { Text, styled } from 'tamagui';
import type { ComponentProps } from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md';

const StyledBadge = styled(Text, {
  name: 'Badge',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '$2',
  paddingHorizontal: '$4',
  paddingVertical: '$4',
  borderWidth: 1,
  borderColor: 'transparent',
  color: '$white',
  fontWeight: '700',
  letterSpacing: 0.5,
  fontSize: '$2',

  variants: {
    variant: {
      success: {
        backgroundColor: '$success',
        borderColor: '$successBorder',
      },
      warning: {
        backgroundColor: '$warning',
        borderColor: '$warningBorder',
      },
      error: {
        backgroundColor: '$danger',
        borderColor: '$dangerBorder',
      },
      info: {
        backgroundColor: '$primary',
        borderColor: '$infoBorder',
      },
      neutral: {
        backgroundColor: '$neutral',
        borderColor: '$neutralBorder',
      },
    },
    size: {
      sm: {
        paddingHorizontal: '$3',
        paddingVertical: '$3',
        borderRadius: '$1',
        fontSize: '$1',
      },
      md: {
        paddingHorizontal: '$4',
        paddingVertical: '$4',
        borderRadius: '$2',
        fontSize: '$2',
      },
    },
    gameVariant: {
      cyberpunk: {
        backgroundColor: '$cyberpunkPrimary',
        borderColor: '$cyberpunkAccent',
      },
      underwater: {
        backgroundColor: '$underwaterPrimary',
        borderColor: '$underwaterAccent',
      },
      crime: {
        backgroundColor: '$crimePrimary',
        borderColor: '$crimeAccent',
      },
      horror: {
        backgroundColor: '$horrorPrimary',
        borderColor: '$horrorAccent',
      },
      adventure: {
        backgroundColor: '$adventurePrimary',
        borderColor: '$adventureAccent',
      },
      'high-altitude-hike': {
        backgroundColor: '$hikePrimary',
        borderColor: '$hikeSecondary',
      },
    },
    pulse: {
      true: {
        animation: 'slow',
      },
    },
  } as const,

  defaultVariants: {
    variant: 'neutral',
    size: 'md',
  },
});

import { memo } from 'react';
import type { ReactElement } from 'react';

export type BadgeProps = ComponentProps<typeof StyledBadge> & {
  title?: string;
  /** @deprecated Use onClick instead */
  onPress?: () => void;
  onClick?: (e: unknown) => void;
};

interface BadgeInnerProps extends BadgeProps {
  // Destructure props that might leak
  $variant?: string;
  $status?: string;
  isHost?: boolean;
}

import { filterProps } from '../../utils/filterProps';

export const Badge = memo(function Badge({ 
  variant, 
  size, 
  gameVariant, 
  pulse,
  onPress,
  onClick,
  ...rest 
}: BadgeInnerProps): ReactElement {
  const filteredProps = filterProps({ ...rest, onPress, onClick });

  return (
    <StyledBadge 
      variant={variant} 
      size={size} 
      gameVariant={gameVariant} 
      pulse={pulse}
      {...filteredProps} 
    />
  );
});

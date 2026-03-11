import { Text, styled } from 'tamagui';
import type { ComponentProps } from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md';

export const Badge = styled(Text, {
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

export type BadgeProps = ComponentProps<typeof Badge>;

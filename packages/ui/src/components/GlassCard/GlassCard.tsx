'use client';
import { YStack, styled, GetProps } from 'tamagui';
import { memo } from 'react';
import type { ReactNode, ReactElement } from 'react';

export type GlassCardProps = GetProps<typeof YStack> & {
  children: ReactNode;
  animated?: boolean;
};

export const StyledGlassCard = styled(YStack, {
  name: 'GlassCard',
  backgroundColor: '$glassBg',
  borderColor: '$glassBorder',
  borderWidth: 1,
  borderRadius: '$6',
  padding: '$7',
  gap: '$5',
  position: 'relative',
  overflow: 'hidden',

  variants: {
    animated: {
      true: {
        animation: 'slow',
      },
    },
  } as const,

  defaultVariants: {
    animated: true,
  },
});

const TopLine = styled(YStack, {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 1,
  pointerEvents: 'none',
  background: 'linear-gradient(90deg, transparent 0%, $glassBorderHover 50%, transparent 100%)',
});

export interface GlassCardInnerProps extends GlassCardProps {
  // Destructure props that might leak
  $visible?: boolean;
  $position?: 'top' | 'bottom' | 'left' | 'right';
  isHost?: boolean;
}

export const GlassCard = StyledGlassCard.styleable<
  Omit<GlassCardInnerProps, 'children'> & GetProps<typeof StyledGlassCard>
>(({ children, $visible, $position, isHost, ...props }, ref) => (
  <StyledGlassCard {...props} ref={ref}>
    <TopLine />
    {children}
  </StyledGlassCard>
));

'use client';
import { YStack, styled, GetProps } from 'tamagui';
import type { ComponentProps } from 'react';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

const StyledContainer = styled(YStack, {
  name: 'Container',
  marginHorizontal: 'auto',
  width: '100%',
  gap: '$4',

  variants: {
    size: {
      sm: { maxWidth: 600 },
      md: { maxWidth: 800 },
      lg: { maxWidth: 1000 },
      xl: { maxWidth: 1400 },
      full: { maxWidth: '100%' },
    },
  } as const,

  defaultVariants: {
    size: 'lg',
  },
});

import { filterProps } from '../../utils/filterProps';

export type ContainerProps = GetProps<typeof StyledContainer> & {
  size?: ContainerSize;
  /** @deprecated Use onClick instead */
  onPress?: () => void;
  onClick?: (e: unknown) => void;
};

export const Container = StyledContainer.styleable<ContainerProps>(({ onPress, onClick, ...props }, ref) => {
  const filteredProps = filterProps({ ...props, onPress, onClick });

  return (
    <StyledContainer 
      {...filteredProps} 
      ref={ref} 
    />
  );
});

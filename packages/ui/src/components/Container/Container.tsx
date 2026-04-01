import { YStack, styled } from 'tamagui';
import type { ComponentProps } from 'react';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export const Container = styled(YStack, {
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

export type ContainerProps = ComponentProps<typeof Container>;

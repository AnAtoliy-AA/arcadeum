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

export const Container = StyledContainer.styleable<
  { size?: ContainerSize } & GetProps<typeof StyledContainer>
>((props, ref) => <StyledContainer {...props} ref={ref} />);

export type ContainerProps = ComponentProps<typeof Container>;

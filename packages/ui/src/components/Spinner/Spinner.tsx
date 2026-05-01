import { Spinner as TamaguiSpinner, styled, TamaguiComponent } from 'tamagui';
import type { ComponentProps } from 'react';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export const Spinner: TamaguiComponent = styled(TamaguiSpinner, {
  name: 'Spinner',
  color: '$primary',

  variants: {
    size: {
      sm: { size: 'small' },
      md: { size: 'large' },
      lg: { scale: 1.5 },
    },
  } as const,

  defaultVariants: {
    size: 'md',
  },
});

export type SpinnerProps = ComponentProps<typeof Spinner>;

import { YStack, styled } from 'tamagui';
import type { ComponentProps } from 'react';

export const Divider = styled(YStack, {
  name: 'Divider',
  backgroundColor: '$borderColor',
  opacity: 0.5,

  variants: {
    vertical: {
      true: {
        width: 1,
        height: '100%',
      },
      false: {
        height: 1,
        width: '100%',
      },
    },
    spacing: {
      none: { margin: 0 },
      xs: { margin: '$1' },
      sm: { margin: '$2' },
      md: { margin: '$4' },
      lg: { margin: '$6' },
      xl: { margin: '$8' },
    },
  } as const,

  defaultVariants: {
    vertical: false,
    spacing: 'md',
  },
});

export type DividerProps = ComponentProps<typeof Divider>;

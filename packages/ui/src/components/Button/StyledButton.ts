import { Button as TButton, styled, TamaguiComponent } from 'tamagui';
import { sharedButtonVariants, sharedButtonSizes } from './SharedButtonStyles';

export const StyledButton: TamaguiComponent<any, any, any, any> = styled(TButton, {
  name: 'AppButton',
  borderRadius: '$4',
  borderWidth: 1,
  borderColor: 'transparent',

  hoverStyle: {
    y: -3,
    scale: 1.02,
    borderColor: '$borderColorHover',
    opacity: 1,
  },
  pressStyle: {
    scale: 0.96,
    y: 0,
    opacity: 0.9,
  },

  variants: {
    ...sharedButtonSizes,
    ...sharedButtonVariants,

    fullWidth: {
      true: { width: '100%' },
    },

    pulse: {
      true: { animation: 'pulse' },
    },

    isActive: {
      true: {
        y: -2,
        backgroundColor: '$glassBgHover',
        borderColor: '$glassBorderHover',
      },
      false: {},
    },

    disabled: {
      true: {
        opacity: 0.4,
        pointerEvents: 'none',
      },
    },

    uppercase: {
      true: {
        textTransform: 'uppercase',
      },
    },

    pill: {
      true: {
        borderRadius: 999,
      },
    },

  } as const,

  defaultVariants: {
    buttonSize: 'md',
    variant: 'secondary',
  },
});

import { Input as TamaguiInput, styled, GetProps, TamaguiComponent } from 'tamagui';

const StyledInput = styled(TamaguiInput, {
  name: 'Input',
  paddingHorizontal: '$4',
  paddingVertical: '$3',
  borderRadius: '$4',
  borderWidth: 1,
  backgroundColor: '$background',
  borderColor: '$borderColor',
  color: '$color',
  fontSize: '$4',
  fontFamily: '$body',

  hoverStyle: {
    borderColor: '$primary',
  },

  focusStyle: {
    borderColor: '$primary',
    borderWidth: 2,
    outlineColor: 'transparent',
  },

  variants: {
    size: {
      sm: { height: 36, px: '$3', fontSize: '$3' },
      md: { height: 48, px: '$4', fontSize: '$4' },
      lg: { height: 60, px: '$5', fontSize: '$5' },
    },
    error: {
      true: {
        borderColor: '$error',
        hoverStyle: { borderColor: '$error' },
        focusStyle: { borderColor: '$error' },
      },
    },
    fullWidth: {
      true: {
        width: '100%',
      },
    },
  } as const,
  defaultVariants: {
    size: 'md',
  },
});

export type InputProps = GetProps<typeof TamaguiInput> & {
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  fullWidth?: boolean;
};

export const Input: TamaguiComponent<InputProps> = StyledInput as TamaguiComponent<InputProps>;

Input.displayName = 'Input';

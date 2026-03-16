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
});

export type InputProps = GetProps<typeof TamaguiInput> & {
  error?: boolean;
  fullWidth?: boolean;
};

export const Input: TamaguiComponent<InputProps> = StyledInput as TamaguiComponent<InputProps>;

Input.displayName = 'Input';

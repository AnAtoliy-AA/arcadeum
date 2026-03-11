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

export type InputProps = {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChange?: (e: any) => void;
  onChangeText?: (text: string) => void;
  onFocus?: (e: any) => void;
  onBlur?: (e: any) => void;
  onKeyPress?: (e: any) => void;
  onKeyDown?: (e: any) => void;
  disabled?: boolean;
  type?: string;
  error?: boolean;
  fullWidth?: boolean;
  'data-testid'?: string;
  'aria-label'?: string;
  id?: string;
  name?: string;
  autoFocus?: boolean;
  required?: boolean;
  style?: any;
  min?: string | number;
  max?: string | number;
  autoComplete?: string;
  inputMode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
};

export const Input: TamaguiComponent<InputProps> = StyledInput.styleable<InputProps>(
  ({ error, fullWidth, ...rest }, ref) => (
    <StyledInput ref={ref} error={error} fullWidth={fullWidth} {...rest} />
  )
);

Input.displayName = 'Input';

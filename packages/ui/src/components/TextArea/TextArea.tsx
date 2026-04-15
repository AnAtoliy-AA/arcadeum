import { TextArea as TamaguiTextArea, styled, GetProps, TamaguiComponent } from 'tamagui';

const StyledTextArea = styled(TamaguiTextArea, {
  name: 'TextArea',
  paddingHorizontal: '$4',
  paddingVertical: '$3',
  borderRadius: '$4',
  borderWidth: 1,
  backgroundColor: '$background',
  borderColor: '$borderColor',
  color: '$color',
  fontSize: '$4',
  fontFamily: '$body',
  minHeight: 120,

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

export type TextAreaProps = {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChange?: GetProps<typeof TamaguiTextArea>['onChange'];
  onChangeText?: (text: string) => void;
  onFocus?: GetProps<typeof TamaguiTextArea>['onFocus'];
  onBlur?: GetProps<typeof TamaguiTextArea>['onBlur'];
  disabled?: boolean;
  error?: boolean;
  fullWidth?: boolean;
  'data-testid'?: string;
  id?: string;
  name?: string;
  autoFocus?: boolean;
  rows?: number;
  required?: boolean;
};

export const TextArea: TamaguiComponent<TextAreaProps> = StyledTextArea.styleable<TextAreaProps>(
  (
    {
      value,
      defaultValue,
      placeholder,
      onChange,
      onChangeText,
      onFocus,
      onBlur,
      disabled,
      error,
      fullWidth,
      'data-testid': dataTestId,
      id,
      name,
      autoFocus,
      rows,
      required,
    },
    ref
  ) => (
    <StyledTextArea
      ref={ref}
      value={value}
      defaultValue={defaultValue}
      placeholder={placeholder}
      onChange={onChange}
      onChangeText={onChangeText}
      onFocus={onFocus}
      onBlur={onBlur}
      disabled={disabled}
      error={error}
      fullWidth={fullWidth}
      data-testid={dataTestId}
      id={id}
      name={name}
      autoFocus={autoFocus}
      rows={rows}
      required={required}
    />
  )
);

TextArea.displayName = 'TextArea';

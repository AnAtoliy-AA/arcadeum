'use client';

import {
  forwardRef,
  useState,
  useId,
  type ChangeEvent,
  type CSSProperties,
} from 'react';
import { Input as TamaguiInput, YStack, styled, useTheme } from 'tamagui';

export type FloatingLabelInputProps = {
  id?: string;
  name?: string;
  type?: string;
  label: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  fullWidth?: boolean;
  error?: boolean;
  'data-testid'?: string;
};

const Wrapper = styled(YStack, {
  name: 'FloatingLabelInputWrapper',
  position: 'relative',
  variants: {
    fullWidth: {
      true: { width: '100%' },
    },
  } as const,
});

const StyledFlInput = styled(TamaguiInput, {
  name: 'FloatingLabelInputField',
  paddingTop: 22,
  paddingBottom: 10,
  paddingHorizontal: 14,
  borderRadius: '$3',
  borderWidth: 1,
  backgroundColor: '$background',
  borderColor: '$borderColor',
  color: '$color',
  fontSize: 15,
  width: '100%',
  height: 56,
  hoverStyle: { borderColor: '$primary' },
  focusStyle: {
    borderColor: '$accent',
    borderWidth: 2,
    outlineColor: 'transparent',
  },
  variants: {
    error: {
      true: {
        borderColor: '$danger',
        focusStyle: { borderColor: '$danger' },
      },
    },
  } as const,
});

const baseLabelStyle: CSSProperties = {
  position: 'absolute',
  left: 14,
  pointerEvents: 'none',
  paddingLeft: 4,
  paddingRight: 4,
  transition: 'top 160ms ease, font-size 160ms ease, color 160ms ease',
  fontFamily: 'inherit',
};

export const FloatingLabelInput = forwardRef<
  HTMLInputElement,
  FloatingLabelInputProps
>(function FloatingLabelInput(
  {
    id: idProp,
    name,
    type = 'text',
    label,
    value: valueProp,
    defaultValue,
    onChange,
    required,
    disabled,
    autoComplete,
    fullWidth = true,
    error,
    'data-testid': testId,
  },
  ref,
) {
  const theme = useTheme();
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const isControlled = valueProp !== undefined;
  const [internal, setInternal] = useState(defaultValue ?? '');
  const value = isControlled ? valueProp : internal;
  const [focused, setFocused] = useState(false);
  const filled = (value ?? '').length > 0;

  const accent = theme.accent?.get?.() ?? '#38bdf8';
  const background = theme.background?.get?.() ?? '#06011b';
  const textSecondary = theme.textSecondary?.get?.() ?? '#8e9196';

  const isFloated = focused || filled;
  const labelStyle: CSSProperties = isFloated
    ? {
        ...baseLabelStyle,
        top: -8,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: accent,
        backgroundColor: background,
      }
    : {
        ...baseLabelStyle,
        top: 17,
        fontSize: 15,
        color: textSecondary,
        backgroundColor: 'transparent',
      };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (!isControlled) setInternal(v);
    onChange?.(v);
  };

  return (
    <Wrapper fullWidth={fullWidth}>
      <StyledFlInput
        ref={ref as never}
        id={id}
        name={name}
        type={type}
        value={value ?? ''}
        onChange={handleChange as never}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        error={error}
        placeholder=" "
        data-testid={testId}
      />
      <label htmlFor={id} style={labelStyle}>
        {label}
        {required ? (
          <span style={{ color: accent, marginLeft: 2 }}> *</span>
        ) : null}
      </label>
    </Wrapper>
  );
});

FloatingLabelInput.displayName = 'FloatingLabelInput';

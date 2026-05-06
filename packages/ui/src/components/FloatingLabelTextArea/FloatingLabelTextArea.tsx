'use client';

import {
  forwardRef,
  useState,
  useId,
  type ChangeEvent,
  type CSSProperties,
} from 'react';
import { TextArea as TamaguiTextArea, YStack, styled } from 'tamagui';

export type FloatingLabelTextAreaProps = {
  id?: string;
  name?: string;
  label: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  error?: boolean;
  maxLength?: number;
  rows?: number;
  'data-testid'?: string;
};

const Wrapper = styled(YStack, {
  name: 'FloatingLabelTextAreaWrapper',
  position: 'relative',
  variants: {
    fullWidth: {
      true: { width: '100%' },
    },
  } as const,
});

const StyledFlTextArea = styled(TamaguiTextArea, {
  name: 'FloatingLabelTextAreaField',
  paddingTop: 24,
  paddingBottom: 28,
  paddingHorizontal: 14,
  borderRadius: '$3',
  borderWidth: 1,
  backgroundColor: '$background',
  borderColor: '$borderColor',
  color: '$color',
  fontSize: 15,
  width: '100%',
  minHeight: 200,
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

const restingLabelStyle: CSSProperties = {
  top: 18,
  fontSize: 15,
  color: 'var(--textSecondary)',
  backgroundColor: 'transparent',
};

const floatedLabelStyle: CSSProperties = {
  top: -8,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--accent)',
  backgroundColor: 'var(--background)',
};

const requiredStyle: CSSProperties = {
  color: 'var(--accent)',
  marginLeft: 2,
};

const counterStyle: CSSProperties = {
  position: 'absolute',
  right: 12,
  bottom: 8,
  fontSize: 11,
  fontVariantNumeric: 'tabular-nums',
  color: 'var(--textSecondary)',
  pointerEvents: 'none',
};

const counterWarnStyle: CSSProperties = {
  ...counterStyle,
  color: 'var(--warning)',
};

export const FloatingLabelTextArea = forwardRef<
  HTMLTextAreaElement,
  FloatingLabelTextAreaProps
>(function FloatingLabelTextArea(
  {
    id: idProp,
    name,
    label,
    value: valueProp,
    defaultValue,
    onChange,
    required,
    disabled,
    fullWidth = true,
    error,
    maxLength,
    rows,
    'data-testid': testId,
  },
  ref,
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const isControlled = valueProp !== undefined;
  const [internal, setInternal] = useState(defaultValue ?? '');
  const value = isControlled ? valueProp : internal;
  const [focused, setFocused] = useState(false);
  const filled = (value ?? '').length > 0;

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    if (!isControlled) setInternal(v);
    onChange?.(v);
  };

  const length = (value ?? '').length;
  const warn = maxLength ? length > maxLength * 0.85 : false;

  return (
    <Wrapper fullWidth={fullWidth}>
      <StyledFlTextArea
        ref={ref as never}
        id={id}
        name={name}
        value={value ?? ''}
        onChange={handleChange as never}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        disabled={disabled}
        error={error}
        rows={rows}
        maxLength={maxLength}
        placeholder=" "
        data-testid={testId}
      />
      <label
        htmlFor={id}
        style={{
          ...baseLabelStyle,
          ...(focused || filled ? floatedLabelStyle : restingLabelStyle),
        }}
      >
        {label}
        {required ? <span style={requiredStyle}> *</span> : null}
      </label>
      {maxLength ? (
        <span style={warn ? counterWarnStyle : counterStyle}>
          {length} / {maxLength}
        </span>
      ) : null}
    </Wrapper>
  );
});

FloatingLabelTextArea.displayName = 'FloatingLabelTextArea';

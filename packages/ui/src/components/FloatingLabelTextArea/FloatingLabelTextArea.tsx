'use client';

import {
  forwardRef,
  useState,
  useId,
  type ChangeEvent,
  type CSSProperties,
} from 'react';

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
  minLength?: number;
  maxLength?: number;
  rows?: number;
  'data-testid'?: string;
};

const baseLabelStyle: CSSProperties = {
  position: 'absolute',
  left: 14,
  pointerEvents: 'none',
  paddingLeft: 4,
  paddingRight: 4,
  transition: 'top 160ms ease, font-size 160ms ease, color 160ms ease',
  fontFamily: 'inherit',
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
    minLength,
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

  const accent = 'var(--accent)';
  const background = 'var(--background)';
  const textSecondary = 'var(--textSecondary)';
  const warning = 'var(--warning)';

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
        top: 18,
        fontSize: 15,
        color: textSecondary,
        backgroundColor: 'transparent',
      };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    if (!isControlled) setInternal(v);
    onChange?.(v);
  };

  const length = (value ?? '').length;
  const warn = maxLength ? length > maxLength * 0.85 : false;
  const counterStyle: CSSProperties = {
    position: 'absolute',
    right: 12,
    bottom: 8,
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    color: warn ? warning : textSecondary,
    pointerEvents: 'none',
  };

  return (
    <div
      style={{ position: 'relative', width: fullWidth ? '100%' : undefined }}
    >
      <textarea
        ref={ref}
        id={id}
        name={name}
        value={value ?? ''}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        disabled={disabled}
        rows={rows}
        minLength={minLength}
        maxLength={maxLength}
        placeholder=" "
        data-testid={testId}
        style={{
          paddingTop: 24,
          paddingBottom: 28,
          paddingLeft: 14,
          paddingRight: 14,
          borderRadius: 12,
          borderWidth: 1,
          borderStyle: 'solid',
          backgroundColor: 'var(--background)',
          borderColor: error ? 'var(--danger)' : 'var(--borderColor)',
          color: 'var(--color)',
          fontSize: 15,
          width: '100%',
          minHeight: 200,
          outline: 'none',
          transition: 'border-color 160ms ease',
        }}
        onMouseEnter={(e) => {
          if (!error) e.currentTarget.style.borderColor = 'var(--primary)';
        }}
        onMouseLeave={(e) => {
          if (!error && !focused) {
            e.currentTarget.style.borderColor = 'var(--borderColor)';
          }
        }}
        onFocusCapture={(e) => {
          if (!error) e.currentTarget.style.borderColor = 'var(--accent)';
        }}
        onBlurCapture={(e) => {
          if (!error) e.currentTarget.style.borderColor = 'var(--borderColor)';
        }}
      />
      <label htmlFor={id} style={labelStyle}>
        {label}
        {required ? (
          <span style={{ color: accent, marginLeft: 2 }}> *</span>
        ) : null}
      </label>
      {maxLength ? (
        <span style={counterStyle}>
          {length} / {maxLength}
        </span>
      ) : null}
    </div>
  );
});

FloatingLabelTextArea.displayName = 'FloatingLabelTextArea';

'use client';

import {
  forwardRef,
  useState,
  useId,
  type ChangeEvent,
  type CSSProperties,
} from 'react';
import { cx } from '../../utils/cx';

export type FloatingLabelInputProps = {
  id?: string;
  name?: string;
  type?: string;
  label: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  fullWidth?: boolean;
  error?: boolean;
  maxLength?: number;
  className?: string;
  'data-testid'?: string;
};

const accent = 'var(--accent)';
const background = 'var(--background)';
const textSecondary = 'var(--textSecondary)';

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
    onBlur,
    required,
    disabled,
    autoComplete,
    fullWidth = true,
    error,
    maxLength,
    className,
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
    <div
      className={cx('relative', fullWidth && 'w-full', className)}
    >
      <input
        ref={ref}
        id={id}
        name={name}
        type={type}
        value={value ?? ''}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        maxLength={maxLength}
        placeholder=" "
        data-testid={testId}
        className={cx(
          'h-[56px] w-full rounded-[12px] border bg-[var(--background)] px-3.5 pb-[10px] pt-[22px] text-[15px] text-[var(--color)] outline-none transition-[border-color] duration-150',
          error
            ? 'border-[var(--danger)] focus:border-[2px] focus:border-[var(--danger)]'
            : 'border-[var(--borderColor)] hover:border-[var(--primary)] focus:border-[2px] focus:border-[var(--accent)]',
        )}
      />
      <label htmlFor={id} style={labelStyle}>
        {label}
        {required ? (
          <span style={{ color: accent, marginLeft: 2 }}> *</span>
        ) : null}
      </label>
    </div>
  );
});

FloatingLabelInput.displayName = 'FloatingLabelInput';

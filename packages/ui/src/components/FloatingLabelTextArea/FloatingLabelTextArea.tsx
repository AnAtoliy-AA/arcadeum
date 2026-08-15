'use client';

import {
  forwardRef,
  useState,
  useId,
  type ChangeEvent,
  type CSSProperties,
} from 'react';
import { cx } from '../../utils/cx';

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
  className?: string;
  'data-testid'?: string;
};

const accent = 'var(--accent)';
const background = 'var(--background)';
const textSecondary = 'var(--textSecondary)';
const warning = 'var(--warning)';

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

  return (
    <div
      className={cx('relative', fullWidth && 'w-full', className)}
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
        className={cx(
          'min-h-[200px] w-full rounded-[12px] border bg-[var(--background)] px-3.5 pb-7 pt-6 text-[15px] text-[var(--color)] outline-none transition-[border-color] duration-150',
          error
            ? 'border-[var(--danger)]'
            : 'border-[var(--borderColor)] hover:border-[var(--primary)] focus:border-[2px] focus:border-[var(--accent)]',
        )}
      />
      <label htmlFor={id} style={labelStyle}>
        {label}
        {required ? (
          <span style={{ color: accent, marginLeft: 2 }}> *</span>
        ) : null}
      </label>
      {maxLength ? (
        <span
          className={cx(
            'pointer-events-none absolute bottom-2 right-3 text-[11px] tabular-nums',
            warn ? 'text-[var(--warning)]' : 'text-[var(--textSecondary)]',
          )}
        >
          {length} / {maxLength}
        </span>
      ) : null}
    </div>
  );
});

FloatingLabelTextArea.displayName = 'FloatingLabelTextArea';

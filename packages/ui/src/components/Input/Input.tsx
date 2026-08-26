'use client';
import { forwardRef } from 'react';
import { cx } from '../../utils/cx';
import { fieldBorderClasses } from '../../utils/fieldClasses';

export type InputProps = {
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  fullWidth?: boolean;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  type?: string;
  id?: string;
  name?: string;
  maxLength?: number;
  minLength?: number;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  pattern?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  autoComplete?: string;
  spellCheck?: boolean;
  tabIndex?: number;
  title?: string;
  onClick?: React.MouseEventHandler<HTMLInputElement>;
  'data-testid'?: string;
  'aria-label'?: string;
  'aria-required'?: boolean | 'true' | 'false';
  className?: string;
  style?: React.CSSProperties;
};

const sizeClasses: Record<NonNullable<InputProps['size']>, string> = {
  sm: 'h-9 px-3 text-[14px]',
  md: 'h-12 px-4 text-[16px]',
  lg: 'h-[60px] px-5 text-[20px]',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size = 'md',
    error,
    fullWidth,
    value,
    defaultValue,
    placeholder,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
    disabled,
    required,
    readOnly,
    autoFocus,
    type,
    id,
    name,
    maxLength,
    minLength,
    min,
    max,
    step,
    pattern,
    inputMode,
    autoComplete,
    spellCheck,
    tabIndex,
    title,
    onClick,
    'data-testid': dataTestId,
    'aria-label': ariaLabel,
    'aria-required': ariaRequired,
    className,
    style,
  },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cx(
        'rounded-[16px] border bg-[var(--background)] text-[var(--color)] outline-none transition-[border-color] duration-200',
        sizeClasses[size],
        fullWidth && 'w-full',
        fieldBorderClasses(!!error),
        className,
      )}
      style={style}
      value={value}
      defaultValue={defaultValue}
      placeholder={placeholder}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      disabled={disabled}
      required={required}
      readOnly={readOnly}
      autoFocus={autoFocus}
      type={type}
      id={id}
      name={name}
      maxLength={maxLength}
      minLength={minLength}
      min={min}
      max={max}
      step={step}
      pattern={pattern}
      inputMode={inputMode}
      autoComplete={autoComplete}
      spellCheck={spellCheck}
      tabIndex={tabIndex}
      title={title}
      onClick={onClick}
      data-testid={dataTestId}
      aria-label={ariaLabel}
      aria-required={ariaRequired}
    />
  );
});

Input.displayName = 'Input';

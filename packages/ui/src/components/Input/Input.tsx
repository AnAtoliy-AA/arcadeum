import { forwardRef } from 'react';
import { cx } from '../../utils/cx';

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
  disabled?: boolean;
  required?: boolean;
  type?: string;
  id?: string;
  name?: string;
  maxLength?: number;
  min?: number | string;
  max?: number | string;
  autoComplete?: string;
  'data-testid'?: string;
  'aria-label'?: string;
  'aria-required'?: boolean | string;
  className?: string;
  style?: React.CSSProperties;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'>;

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
    className,
    style,
    onChange,
    ...rest
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
        error
          ? 'border-[var(--error)]'
          : 'border-[var(--borderColor)] hover:border-[var(--primary)] focus:border-[var(--primary)] focus:border-[2px]',
        className,
      )}
      style={style}
      onChange={onChange}
      {...rest}
    />
  );
});

Input.displayName = 'Input';

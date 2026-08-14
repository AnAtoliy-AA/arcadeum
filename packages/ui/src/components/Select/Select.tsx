import { memo } from 'react';
import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';

export type SelectProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  error?: boolean;
  fullWidth?: boolean;
  options?: { label: string; value: string }[];
  children?: ReactNode;
  id?: string;
  name?: string;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  'data-testid'?: string;
  onChange?: (e: { target: { value: string } }) => void;
  style?: React.CSSProperties;
  className?: string;
  'aria-label'?: string;
  size?: 'sm' | 'md' | 'lg';
};

const sizeClasses: Record<NonNullable<SelectProps['size']>, string> = {
  sm: 'h-9 px-3 text-[13px]',
  md: 'h-12 px-4 text-[14px]',
  lg: 'h-[60px] px-5 text-[15px]',
};

export const Select = memo(function Select({
  error = false,
  fullWidth = false,
  size = 'md',
  options,
  children,
  onValueChange,
  onChange,
  value,
  defaultValue,
  id,
  name,
  disabled,
  open,
  onOpenChange,
  'data-testid': dataTestId,
  style,
  className,
  'aria-label': ariaLabel,
}: SelectProps) {
  const handleValueChange = (val: string) => {
    onValueChange?.(val);
    onChange?.({ target: { value: val } });
  };

  return (
    <select
      id={id}
      name={name}
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      onChange={(e) => handleValueChange(e.target.value)}
      onClick={open !== undefined ? () => onOpenChange?.(!open) : undefined}
      aria-label={ariaLabel}
      data-testid={dataTestId}
      style={style}
      className={cx(
        'appearance-none',
        'cursor-pointer',
        'rounded-[16px]',
        'border',
        'bg-[var(--background)]',
        'text-[var(--color)]',
        'outline-none',
        'transition-[border-color] duration-200',
        fullWidth ? 'w-full' : 'w-auto',
        error
          ? 'border-[var(--error)]'
          : 'border-[var(--borderColor)] hover:border-[var(--primary)] focus:border-[var(--primary)] focus:border-[2px]',
        sizeClasses[size],
        className,
      )}
    >
      {options?.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
      {children}
    </select>
  );
});

'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState, Children, isValidElement } from 'react';
import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { ChevronDownIcon } from '../Icons';

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

const triggerBaseClasses =
  'flex cursor-pointer items-center justify-between gap-3 rounded-[16px] border bg-[var(--background)] text-[var(--color)] outline-none transition-[border-color] duration-200';

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
  open: openProp,
  onOpenChange,
  'data-testid': dataTestId,
  style,
  className,
  'aria-label': ariaLabel,
}: SelectProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = openProp !== undefined;
  const isOpen = isControlled ? openProp : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const [internalValue, setInternalValue] = useState(
    defaultValue ?? value ?? '',
  );
  const selectedValue = value !== undefined ? value : internalValue;

  const optionList = useMemo(() => {
    if (options) return options;
    return Children.toArray(children)
      .filter(
        (child): child is React.ReactElement<{
          value?: string | number;
          children?: ReactNode;
        }> => isValidElement(child) && child.type === 'option',
      )
      .map((child) => ({
        value: String(child.props.value ?? ''),
        label: String(child.props.children ?? ''),
      }));
  }, [options, children]);

  const selectedLabel =
    optionList.find((opt) => opt.value === selectedValue)?.label ?? '';

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, setOpen]);

  const handleSelect = useCallback(
    (val: string) => {
      onValueChange?.(val);
      onChange?.({ target: { value: val } });
      if (value === undefined) setInternalValue(val);
      setOpen(false);
    },
    [onValueChange, onChange, value, setOpen],
  );

  return (
    <div
      ref={containerRef}
      className={cx('relative', fullWidth ? 'w-full' : 'w-auto', className)}
      style={style}
    >
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        data-testid={dataTestId}
        onClick={() => setOpen(!isOpen)}
        className={cx(
          triggerBaseClasses,
          fullWidth ? 'w-full' : 'w-auto',
          error
            ? 'border-[var(--error)]'
            : 'border-[var(--borderColor)] hover:border-[var(--primary)] focus:border-[var(--primary)] focus:border-[2px]',
          sizeClasses[size],
        )}
      >
        <span className="truncate">{selectedLabel}</span>
        <span
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
          }}
        >
          <ChevronDownIcon size={16} />
        </span>
      </button>
      <input type="hidden" name={name} value={selectedValue} />

      {isOpen && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 z-[50] mt-2 max-h-72 overflow-y-auto rounded-[16px] border border-[var(--borderColorHover)] bg-[var(--background)] py-2 shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
        >
          {optionList.map((opt) => (
            <li key={opt.value} role="option" aria-selected={opt.value === selectedValue}>
              <button
                type="button"
                tabIndex={-1}
                onClick={() => handleSelect(opt.value)}
                className={cx(
                  'w-full px-4 py-2 text-left text-[14px] transition-colors duration-100',
                  opt.value === selectedValue
                    ? 'bg-[var(--backgroundHover)] font-semibold text-[var(--color)]'
                    : 'text-[var(--textSecondary)] hover:bg-[var(--backgroundHover)] hover:text-[var(--color)]',
                )}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

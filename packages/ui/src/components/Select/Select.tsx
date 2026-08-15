'use client';

import { memo, useCallback, useEffect, useId, useMemo, useRef, useState, Children, isValidElement } from 'react';
import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { fieldBorderClasses } from '../../utils/fieldClasses';
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
  const activeOptionRef = useRef<HTMLLIElement>(null);

  // Index of the option highlighted by keyboard navigation.
  const [activeIndex, setActiveIndex] = useState(0);

  // useId guarantees unique listbox ids even for id-less instances.
  const generatedId = useId();
  const listboxId = `${id ?? generatedId}-listbox`;
  const activeOptionId = `${listboxId}-option-${optionList[activeIndex]?.value ?? ''}`;

  // Sync highlight with the selected value whenever the dropdown opens.
  useEffect(() => {
    if (!isOpen) return;
    const current = optionList.findIndex((opt) => opt.value === selectedValue);
    setActiveIndex(current >= 0 ? current : 0);
  }, [isOpen, optionList, selectedValue]);

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

  const openDropdown = useCallback(
    (e: React.KeyboardEvent) => {
      e.preventDefault();
      setOpen(true);
    },
    [setOpen],
  );

  const moveActive = useCallback((next: number) => {
    setActiveIndex(next);
    requestAnimationFrame(() => {
      activeOptionRef.current?.scrollIntoView({ block: 'nearest' });
    });
  }, []);

  /**
   * Arrow / Home / End / Enter / Space navigation — shared by the trigger
   * (which keeps focus while the dropdown is open) and the listbox itself.
   */
  const handleNavKey = useCallback(
    (e: React.KeyboardEvent) => {
      const count = optionList.length;
      if (count === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          moveActive((activeIndex + 1) % count);
          break;
        case 'ArrowUp':
          e.preventDefault();
          moveActive((activeIndex - 1 + count) % count);
          break;
        case 'Home':
          e.preventDefault();
          moveActive(0);
          break;
        case 'End':
          e.preventDefault();
          moveActive(count - 1);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          const active = optionList[activeIndex];
          if (active) handleSelect(active.value);
          break;
      }
    },
    [activeIndex, handleSelect, moveActive, optionList],
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
        aria-controls={isOpen ? listboxId : undefined}
        aria-activedescendant={isOpen ? activeOptionId : undefined}
        data-testid={dataTestId}
        onClick={() => setOpen(!isOpen)}
        onKeyDown={(e) => {
          if (isOpen) {
            if (e.key === 'Escape') {
              e.preventDefault();
              setOpen(false);
            } else {
              handleNavKey(e);
            }
          } else if (
            e.key === 'ArrowDown' ||
            e.key === 'ArrowUp' ||
            e.key === ' ' ||
            e.key === 'Enter'
          ) {
            openDropdown(e);
          }
        }}
        className={cx(
          triggerBaseClasses,
          fullWidth ? 'w-full' : 'w-auto',
          fieldBorderClasses(!!error),
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
          id={listboxId}
          role="listbox"
          onKeyDown={handleNavKey}
          className="absolute left-0 right-0 z-[50] mt-2 max-h-72 overflow-y-auto rounded-[16px] border border-[var(--borderColorHover)] bg-[var(--background)] py-2 shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
        >
          {optionList.map((opt, index) => (
            <li
              key={opt.value}
              id={`${listboxId}-option-${opt.value}`}
              ref={index === activeIndex ? activeOptionRef : undefined}
              role="option"
              aria-selected={opt.value === selectedValue}
              onMouseEnter={() => setActiveIndex(index)}
              className={cx(
                index === activeIndex ? 'bg-[var(--backgroundHover)]' : '',
              )}
            >
              <button
                type="button"
                tabIndex={-1}
                onClick={() => handleSelect(opt.value)}
                className={cx(
                  'w-full px-4 py-2 text-left text-[14px] transition-colors duration-100',
                  opt.value === selectedValue
                    ? 'font-semibold text-[var(--color)]'
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

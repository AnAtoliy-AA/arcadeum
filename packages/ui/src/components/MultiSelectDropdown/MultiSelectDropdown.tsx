'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';

export interface MultiSelectOption {
  id: string;
  label: string;
  icon?: ReactNode;
  count?: number;
  disabled?: boolean;
  testId?: string;
  ariaLabel?: string;
}

export type MultiSelectSize = 'sm' | 'md';

export interface MultiSelectDropdownProps {
  label: string;
  options: readonly MultiSelectOption[];
  selectedValues: readonly string[];
  onChange: (values: string[]) => void;
  icon?: ReactNode;
  size?: MultiSelectSize;
  className?: string;
  disabled?: boolean;
  allLabel?: string;
  clearLabel?: string;
  optionAriaLabelPrefix?: string;
  'data-testid'?: string;
  'aria-label'?: string;
}

const triggerSizeClasses: Record<MultiSelectSize, string> = {
  sm: 'h-9 px-3 text-xs gap-1.5',
  md: 'h-10 px-3.5 text-sm gap-2',
};

export function MultiSelectDropdown({
  label,
  options,
  selectedValues,
  onChange,
  icon,
  size = 'sm',
  className,
  disabled = false,
  allLabel = 'All',
  clearLabel = 'Clear',
  optionAriaLabelPrefix = '',
  'data-testid': testId,
  'aria-label': ariaLabel,
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCount = selectedValues.length;
  const isFiltered = selectedCount > 0 && selectedCount < options.length;
  const isAll = selectedCount === 0 || selectedCount === options.length;

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleToggleOption = useCallback(
    (id: string) => {
      if (selectedValues.includes(id)) {
        onChange(selectedValues.filter((v) => v !== id));
      } else {
        onChange([...selectedValues, id]);
      }
    },
    [selectedValues, onChange],
  );

  const handleSelectAll = useCallback(() => {
    onChange([]);
  }, [onChange]);

  const handleClearAll = useCallback(() => {
    onChange([]);
  }, [onChange]);

  const getSummaryText = (): string | null => {
    if (isAll) return null;
    if (selectedCount === 1) {
      const match = options.find((opt) => opt.id === selectedValues[0]);
      return match ? match.label : '1';
    }
    return String(selectedCount);
  };

  const summaryText = getSummaryText();

  return (
    <div ref={containerRef} className={cx('relative inline-block', className)}>
      <button
        type="button"
        disabled={disabled}
        data-testid={testId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel || label}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cx(
          'inline-flex items-center rounded-xl border font-semibold transition-all select-none',
          triggerSizeClasses[size],
          disabled
            ? 'cursor-not-allowed opacity-40 border-[var(--glassBorder)] bg-[var(--backgroundHover)] text-[var(--textSecondary)]'
            : isFiltered
              ? 'cursor-pointer border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--color)] shadow-sm'
              : 'cursor-pointer border-[var(--glassBorder)] bg-[var(--backgroundHover)] text-[var(--textSecondary)] hover:bg-[var(--glassBgHover)] hover:text-[var(--color)]',
        )}
      >
        {icon && (
          <span className="inline-flex shrink-0 items-center justify-center">
            {icon}
          </span>
        )}
        <span>{label}</span>
        {summaryText && (
          <span className="rounded-full bg-[var(--primary)] px-1.5 py-0.2 text-[10px] font-bold text-white">
            {summaryText}
          </span>
        )}
        <svg
          className={cx(
            'h-3.5 w-3.5 text-[var(--textSecondary)] transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute left-0 z-[60] mt-1.5 min-w-[200px] max-w-[280px] rounded-2xl border border-[var(--glassBorderStrong)] bg-[var(--background)] p-1.5 shadow-2xl backdrop-blur-xl animate-[fadeInUp_0.15s_ease-out]"
        >
          <div className="flex items-center justify-between border-b border-[var(--glassBorder)] px-2 pb-1.5 pt-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--textSecondary)]">
              {label}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                role="checkbox"
                aria-checked={isAll}
                aria-label={
                  optionAriaLabelPrefix
                    ? `${optionAriaLabelPrefix}${allLabel}`
                    : allLabel
                }
                onClick={handleSelectAll}
                className="cursor-pointer text-[11px] font-medium text-[var(--primary)] hover:underline"
              >
                {allLabel}
              </button>
              {selectedCount > 0 && (
                <>
                  <span className="text-[var(--glassBorder)]">•</span>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="cursor-pointer text-[11px] font-medium text-rose-400 hover:underline"
                  >
                    {clearLabel}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="mt-1 flex max-h-60 flex-col gap-0.5 overflow-y-auto pr-0.5">
            {options.map((opt) => {
              const active = selectedValues.includes(opt.id);
              const computedAriaLabel =
                opt.ariaLabel ||
                (optionAriaLabelPrefix
                  ? `${optionAriaLabelPrefix}${opt.label}`
                  : opt.label);

              return (
                <button
                  key={opt.id}
                  type="button"
                  role="checkbox"
                  aria-checked={active}
                  aria-label={computedAriaLabel}
                  disabled={opt.disabled}
                  data-testid={opt.testId}
                  onClick={() => handleToggleOption(opt.id)}
                  className={cx(
                    'flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all select-none',
                    opt.disabled
                      ? 'cursor-not-allowed opacity-40'
                      : active
                        ? 'bg-[var(--primary)]/15 text-[var(--color)] font-semibold cursor-pointer'
                        : 'text-[var(--textSecondary)] hover:bg-[var(--glassBgHover)] hover:text-[var(--color)] cursor-pointer',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cx(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-all',
                        active
                          ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                          : 'border-[var(--glassBorderStrong)] bg-[var(--backgroundHover)]',
                      )}
                    >
                      {active && (
                        <svg
                          className="h-2.5 w-2.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={3.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    {opt.icon && (
                      <span className="inline-flex shrink-0 items-center justify-center text-[var(--textSecondary)]">
                        {opt.icon}
                      </span>
                    )}
                    <span>{opt.label}</span>
                  </div>

                  {opt.count !== undefined && (
                    <span className="rounded-full bg-[var(--backgroundHover)] px-1.5 py-0.2 text-[10px] font-bold text-[var(--textSecondary)]">
                      {opt.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { forwardRef } from 'react';
import { cx } from '../../utils/cx';

export type SearchInputSize = 'sm' | 'md' | 'lg';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  size?: SearchInputSize;
  fullWidth?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  id?: string;
  name?: string;
  className?: string;
  'data-testid'?: string;
  'aria-label'?: string;
}

const sizeContainerClasses: Record<SearchInputSize, string> = {
  sm: 'h-9 text-xs',
  md: 'h-10 text-sm',
  lg: 'h-12 text-base',
};

const sizePaddingClasses: Record<SearchInputSize, string> = {
  sm: 'pl-8 pr-7',
  md: 'pl-9 pr-8',
  lg: 'pl-11 pr-10',
};

const sizeIconClasses: Record<SearchInputSize, string> = {
  sm: 'left-2.5 h-3.5 w-3.5',
  md: 'left-3 h-4 w-4',
  lg: 'left-3.5 h-5 w-5',
};

const sizeClearClasses: Record<SearchInputSize, string> = {
  sm: 'right-2 h-4 w-4 text-xs',
  md: 'right-2.5 h-5 w-5 text-sm',
  lg: 'right-3 h-6 w-6 text-base',
};

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    {
      value,
      onChange,
      onClear,
      placeholder,
      size = 'md',
      fullWidth = false,
      disabled = false,
      autoFocus = false,
      id,
      name,
      className,
      'data-testid': testId,
      'aria-label': ariaLabel,
    },
    ref,
  ) {
    const handleClear = () => {
      if (onClear) {
        onClear();
      } else {
        onChange('');
      }
    };

    return (
      <div
        className={cx(
          'relative inline-flex items-center',
          fullWidth ? 'w-full' : 'w-auto',
          className,
        )}
      >
        <span
          className={cx(
            'pointer-events-none absolute flex items-center justify-center text-[var(--textSecondary)]',
            sizeIconClasses[size],
          )}
        >
          <svg
            className="h-full w-full"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </span>

        <input
          ref={ref}
          id={id}
          name={name}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          data-testid={testId}
          aria-label={ariaLabel}
          className={cx(
            'w-full rounded-xl border border-[var(--glassBorder)] bg-[var(--backgroundHover)] text-[var(--color)] placeholder-[var(--textSecondary)] transition-all',
            'focus:border-[var(--primary)] focus:bg-[var(--background)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]',
            sizeContainerClasses[size],
            sizePaddingClasses[size],
            disabled && 'cursor-not-allowed opacity-50',
          )}
        />

        {value.length > 0 && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search input"
            className={cx(
              'absolute flex items-center justify-center rounded-md text-[var(--textSecondary)] transition-colors hover:text-[var(--color)] cursor-pointer',
              sizeClearClasses[size],
            )}
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    );
  },
);

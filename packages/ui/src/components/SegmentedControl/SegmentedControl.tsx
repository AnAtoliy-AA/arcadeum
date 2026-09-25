'use client';

import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';

export interface SegmentedControlItem {
  id: string;
  label: string;
  icon?: ReactNode;
  count?: number;
  disabled?: boolean;
  testId?: string;
  ariaLabel?: string;
}

export type SegmentedControlSize = 'sm' | 'md';

export interface SegmentedControlProps {
  items: readonly SegmentedControlItem[];
  value: string | readonly string[];
  onChange: (id: string) => void;
  size?: SegmentedControlSize;
  className?: string;
  'aria-label'?: string;
  'data-testid'?: string;
}

const itemSizeClasses: Record<SegmentedControlSize, string> = {
  sm: 'h-8 px-2.5 text-xs gap-1.5',
  md: 'h-9 px-3.5 text-xs font-semibold gap-2',
};

export function SegmentedControl({
  items,
  value,
  onChange,
  size = 'md',
  className,
  'aria-label': ariaLabel,
  'data-testid': testId,
}: SegmentedControlProps) {
  const isSelected = (id: string): boolean => {
    if (Array.isArray(value)) {
      return value.includes(id);
    }
    return value === id;
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      data-testid={testId}
      className={cx(
        'inline-flex min-w-max items-center gap-1 rounded-xl border border-[var(--glassBorder)] bg-[var(--backgroundHover)] p-1 backdrop-blur-sm',
        className,
      )}
    >
      {items.map((item) => {
        const active = isSelected(item.id);
        return (
          <button
            key={item.id}
            type="button"
            role="checkbox"
            aria-checked={active}
            aria-label={item.ariaLabel || item.label}
            disabled={item.disabled}
            data-testid={item.testId}
            onClick={() => onChange(item.id)}
            className={cx(
              'relative inline-flex items-center justify-center rounded-lg font-medium transition-all select-none cursor-pointer',
              itemSizeClasses[size],
              active
                ? 'bg-[var(--primary)] text-white shadow-sm shadow-[var(--primary)]/20'
                : 'text-[var(--textSecondary)] hover:bg-[var(--glassBgHover)] hover:text-[var(--color)]',
              item.disabled &&
                'pointer-events-none cursor-not-allowed opacity-40',
            )}
          >
            {item.icon && (
              <span className="inline-flex shrink-0 items-center justify-center">
                {item.icon}
              </span>
            )}
            <span>{item.label}</span>
            {item.count !== undefined && (
              <span
                className={cx(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                  active
                    ? 'bg-white/20 text-white'
                    : 'bg-[var(--background)] text-[var(--textSecondary)]',
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

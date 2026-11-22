'use client';

import { useRef } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { cx } from '../../utils/cx';

export interface TabBarItem {
  id: string;
  label: ReactNode;
  /** Optional count bubble, hidden when 0 or undefined. */
  badge?: number;
  testId?: string;
}

export interface TabBarProps {
  items: readonly TabBarItem[];
  value: string;
  onChange: (id: string) => void;
  'aria-label': string;
  className?: string;
  'data-testid'?: string;
}

/**
 * Underlined tab strip with WAI-ARIA tablist semantics: roving tabindex plus
 * Left/Right/Home/End keyboard navigation. Colors come from theme tokens.
 */
export function TabBar({
  items,
  value,
  onChange,
  'aria-label': ariaLabel,
  className,
  'data-testid': testId,
}: TabBarProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusAt = (index: number) => {
    const target = items[index];
    if (!target) return;
    onChange(target.id);
    refs.current[index]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = items.length - 1;
    if (e.key === 'ArrowRight') focusAt(index === last ? 0 : index + 1);
    else if (e.key === 'ArrowLeft') focusAt(index === 0 ? last : index - 1);
    else if (e.key === 'Home') focusAt(0);
    else if (e.key === 'End') focusAt(last);
    else return;
    e.preventDefault();
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      data-testid={testId}
      className={cx(
        'flex border-b border-[var(--glassBorder)] bg-[var(--backgroundHover)] text-xs font-semibold',
        className,
      )}
    >
      {items.map((item, index) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            data-testid={item.testId}
            onClick={() => onChange(item.id)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cx(
              'flex flex-1 items-center justify-center gap-1.5 border-b-2 py-3 text-center transition-colors',
              'focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--primary)]',
              active
                ? 'border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-[var(--color)]'
                : 'border-transparent text-[var(--textSecondary)] hover:text-[var(--color)]',
            )}
          >
            <span>{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="rounded-full bg-[var(--primary)] px-1.5 py-0.5 text-xs font-bold text-[var(--primaryText)]">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

'use client';

import { cx } from '@arcadeum/ui/utils/cx';

export interface LobbySegmentedItem {
  id: string;
  label: string;
  testId?: string;
}

interface LobbySegmentedProps {
  items: readonly LobbySegmentedItem[];
  value: string;
  onChange: (id: string) => void;
  'aria-label': string;
  className?: string;
}

/**
 * Single-select segmented control (radiogroup) with 44px touch targets.
 * Used for bot count and AI difficulty in the lobby.
 */
export function LobbySegmented({
  items,
  value,
  onChange,
  'aria-label': ariaLabel,
  className,
}: LobbySegmentedProps) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cx(
        'flex w-full flex-row flex-wrap gap-1 rounded-xl border border-[var(--glassBorder)] bg-[var(--backgroundHover)] p-1',
        className,
      )}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={active}
            data-testid={item.testId}
            data-active={active ? 'on' : undefined}
            onClick={() => onChange(item.id)}
            className={cx(
              'min-h-[44px] min-w-[44px] flex-1 rounded-lg px-3 text-sm font-semibold transition-colors motion-reduce:transition-none',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary)]',
              active
                ? 'bg-[var(--primary)] text-[var(--primaryText)] shadow-sm'
                : 'text-[var(--textSecondary)] hover:bg-[var(--glassBgHover)] hover:text-[var(--textPrimary)]',
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

'use client';

import { memo } from 'react';
import { cx } from '../../utils/cx';

export interface ToggleProps {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  ariaLabel: string;
  testId?: string;
  disabled?: boolean;
  /** Text inside the track when the toggle is on. Defaults to "ON". */
  onLabel?: string;
  /** Text inside the track when the toggle is off. Defaults to "OFF". */
  offLabel?: string;
}

export const Toggle = memo(function Toggle({
  checked,
  onCheckedChange,
  ariaLabel,
  testId,
  disabled = false,
  onLabel = 'ON',
  offLabel = 'OFF',
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      data-testid={testId}
      onClick={() => onCheckedChange(!checked)}
      className={cx(
        'relative inline-flex w-[60px] h-[30px] items-center rounded-full border p-0 cursor-pointer shadow-[inset_0_0_0_1px_rgba(0,0,0,0.2)] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
        checked
          ? 'justify-end border-[var(--primary)] bg-[var(--primary)]'
          : 'justify-start border-[rgba(148,163,184,0.4)] bg-[rgba(15,23,42,0.6)]',
      )}
    >
      <span
        aria-hidden
        className={cx(
          'absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-bold tracking-[1px] pointer-events-none',
          checked ? 'text-[rgba(255,255,255,0.9)]' : 'text-transparent',
        )}
      >
        {onLabel}
      </span>
      <span
        aria-hidden
        className={cx(
          'absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold tracking-[1px] pointer-events-none',
          checked ? 'text-transparent' : 'text-[rgba(203,213,225,0.85)]',
        )}
      >
        {offLabel}
      </span>
      <span className="m-0.5 h-6 w-6 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
    </button>
  );
});

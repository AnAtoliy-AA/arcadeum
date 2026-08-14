import { cx } from '../../utils/cx';
import type { ReactNode } from 'react';

export type FilterChipProps = {
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  'aria-label'?: string;
  'aria-pressed'?: boolean | 'true' | 'false';
  'data-testid'?: string;
};

export function FilterChip({
  children,
  active = false,
  disabled = false,
  onClick,
  'aria-label': ariaLabel,
  'aria-pressed': ariaPressed,
  'data-testid': testId,
}: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      role="checkbox"
      aria-checked={active}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      data-testid={testId}
      className={cx(
        'inline-flex w-auto shrink-0 cursor-pointer select-none items-center justify-center gap-1',
        'rounded-[16px] border px-4 py-2 text-[14px] font-semibold',
        'transition-[background-color,border-color,box-shadow] duration-150',
        'focus:outline-none',
        active
          ? 'border-[rgba(255,255,255,0.4)] bg-[rgba(255,255,255,0.12)] text-white'
          : 'border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.7)]',
        'hover:border-[rgba(255,255,255,0.16)] hover:bg-[rgba(255,255,255,0.1)]',
        'active:scale-[0.97]',
        disabled && 'pointer-events-none cursor-not-allowed opacity-40',
      )}
    >
      {children}
    </button>
  );
}

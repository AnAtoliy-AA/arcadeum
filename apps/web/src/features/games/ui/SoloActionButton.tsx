'use client';

import type { ReactNode } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';

export interface SoloActionButtonProps {
  onClick?: () => void;
  icon?: ReactNode;
  children: ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'results';
  dataTestId?: string;
  className?: string;
  title?: string;
  disabled?: boolean;
}

export function SoloActionButton({
  onClick,
  icon,
  children,
  variant = 'primary',
  dataTestId,
  className,
  title,
  disabled = false,
}: SoloActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      data-testid={dataTestId}
      className={cx(
        'inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 h-8 text-xs font-bold whitespace-nowrap transition-all select-none active:scale-95 shadow-sm',
        variant === 'results'
          ? 'border-amber-500/50 bg-amber-500/20 text-amber-600 dark:text-amber-300 hover:bg-amber-500/30 ring-1 ring-amber-500/30'
          : variant === 'secondary'
            ? 'border-[var(--glassBorder)] bg-[var(--backgroundHover)] text-[var(--color)] hover:border-[var(--glassBorderStrong)] font-semibold'
            : 'border-[var(--primary)]/60 bg-[var(--primary)] text-white hover:brightness-110 ring-1 ring-[var(--primary)]/40 shadow-xs',
        disabled && 'opacity-40 cursor-not-allowed',
        className,
      )}
    >
      {icon && <span className="leading-none text-sm">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

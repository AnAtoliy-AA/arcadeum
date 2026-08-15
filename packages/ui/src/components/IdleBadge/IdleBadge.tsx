import { memo } from 'react';
import { cx } from '../../utils/cx';

const idleBadgeClasses: Record<'idle' | 'offline', string> = {
  idle: 'bg-[rgba(146,64,14,0.1)] text-[var(--warning)] border-[rgba(146,64,14,0.4)]',
  offline:
    'bg-[rgba(185,28,28,0.1)] text-[var(--danger)] border-[rgba(185,28,28,0.4)]',
};

export type IdleBadgeProps = {
  variant?: 'idle' | 'offline';
  label?: string;
  className?: string;
};

export const IdleBadge = memo(function IdleBadge({
  variant = 'idle',
  label,
  className,
}: IdleBadgeProps) {
  const emoji = variant === 'offline' ? '🔴' : '💤';
  const defaultLabel = variant === 'offline' ? 'Offline' : 'Idle';
  return (
    <span
      className={cx(
        'box-border inline-flex text-[12px] font-semibold px-3 py-3 rounded border',
        idleBadgeClasses[variant],
        className,
      )}
      data-testid="idle-badge"
    >
      {emoji} {label || defaultLabel}
    </span>
  );
});

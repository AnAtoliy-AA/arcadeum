import { memo } from 'react';
import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Button } from '../Button/Button';

export type NoticeTone = 'info' | 'success' | 'warning' | 'danger' | 'accent';

export type NoticeProps = {
  tone?: NoticeTone;
  /** Leading emoji or icon. Decorative, hidden from assistive tech. */
  icon?: ReactNode;
  children: ReactNode;
  /** `alert` interrupts screen readers (errors); `status` is polite. */
  role?: 'status' | 'alert';
  onDismiss?: () => void;
  /** Accessible label and visible text of the dismiss button. */
  dismissLabel?: string;
  'data-testid'?: string;
  /** data-testid of the dismiss button. */
  dismissTestId?: string;
  className?: string;
};

/** Token driven tints: border and fill derive from the tone token via color-mix. */
const toneClasses: Record<NoticeTone, string> = {
  info: 'border-[color-mix(in_srgb,var(--info)_45%,transparent)] bg-[color-mix(in_srgb,var(--info)_14%,transparent)]',
  success:
    'border-[color-mix(in_srgb,var(--success)_45%,transparent)] bg-[color-mix(in_srgb,var(--success)_14%,transparent)]',
  warning:
    'border-[color-mix(in_srgb,var(--warning)_55%,transparent)] bg-[color-mix(in_srgb,var(--warning)_16%,transparent)]',
  danger:
    'border-[color-mix(in_srgb,var(--danger)_55%,transparent)] bg-[color-mix(in_srgb,var(--danger)_16%,transparent)]',
  accent:
    'border-[color-mix(in_srgb,var(--accent)_45%,transparent)] bg-[color-mix(in_srgb,var(--accent)_14%,transparent)]',
};

export const Notice = memo(function Notice({
  tone = 'info',
  icon,
  children,
  role = 'status',
  onDismiss,
  dismissLabel,
  'data-testid': dataTestId,
  dismissTestId,
  className,
}: NoticeProps) {
  return (
    <div
      role={role}
      data-testid={dataTestId}
      className={cx(
        'flex flex-col gap-1.5 rounded-xl border px-3 py-2 text-xs text-[var(--color)]',
        toneClasses[tone],
        className,
      )}
    >
      <div className="flex items-start gap-2">
        {icon && (
          <span aria-hidden="true" className="shrink-0">
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          padding="px-3"
          onClick={onDismiss}
          data-testid={dismissTestId}
          className="self-center text-xs font-bold uppercase"
        >
          {dismissLabel}
        </Button>
      )}
    </div>
  );
});

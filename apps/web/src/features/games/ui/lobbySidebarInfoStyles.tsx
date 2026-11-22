import type { ReactNode } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';

export const InfoRow = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cx(
      'flex flex-row items-center justify-between py-1.5 max-[800px]:py-1 border-b border-[rgba(99,102,241,0.1)]',
      className,
    )}
  >
    {children}
  </div>
);

export const InfoLabel = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <span
    className={cx(
      'text-[13px] max-[800px]:text-[12px] text-[var(--textSecondary)]',
      className,
    )}
  >
    {children}
  </span>
);

export const InfoValue = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <span
    className={cx(
      'text-[14px] max-[800px]:text-[13px] font-medium text-[var(--color)]',
      className,
    )}
  >
    {children}
  </span>
);

export type RoomStatus = 'lobby' | 'ready' | 'in_progress' | 'completed';

const STATUS_BADGE_CLASSES: Record<RoomStatus, string> = {
  lobby: 'bg-[rgba(16,185,129,0.15)] text-[#10b981]',
  ready: 'bg-[rgba(99,102,241,0.15)] text-[#6366f1]',
  in_progress: 'bg-[rgba(99,102,241,0.15)] text-[#6366f1]',
  completed: 'bg-[rgba(156,163,175,0.15)] text-[#9ca3af]',
};

export const StatusBadge = ({
  status = 'lobby',
  className,
  children,
}: {
  status?: RoomStatus;
  className?: string;
  children?: ReactNode;
}) => (
  <span
    className={cx(
      'text-[13px] max-[800px]:text-[11px] px-2.5 max-[800px]:px-2 py-0.5 max-[800px]:py-px rounded-[8px] font-medium',
      STATUS_BADGE_CLASSES[status],
      className,
    )}
  >
    {children}
  </span>
);

export const FastBadge = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cx(
      'flex flex-row items-center gap-2 px-3 py-1 rounded-[8px] bg-[rgba(234,179,8,0.15)]',
      className,
    )}
  >
    {children}
  </div>
);

export const FastBadgeText = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <span className={cx('text-[14px] font-medium text-[#eab308]', className)}>
    {children}
  </span>
);

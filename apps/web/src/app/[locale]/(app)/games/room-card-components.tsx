import type React from 'react';
import { cx } from '@arcadeum/ui/utils/cx';

export type RoomCardProps = {
  status?: 'completed';
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export function RoomCard({ status, className, ...props }: RoomCardProps) {
  return (
    <div
      className={cx(
        'relative cursor-pointer border border-[var(--glassBorder)] bg-[var(--glassBg)]',
        status === 'completed' && 'border-[rgba(107,114,128,0.2)]',
        className,
      )}
      {...props}
    />
  );
}

const STATUS_BADGE_VARIANTS = {
  lobby: 'bg-[var(--success)] shadow-[0_0_10px_rgba(16,185,129,0.3)]',
  in_progress: 'bg-[var(--warning)] shadow-[0_0_10px_rgba(245,158,11,0.3)]',
  completed: 'bg-[var(--neutral)] shadow-[0_0_10px_rgba(107,114,128,0.3)]',
} as const;

export type StatusBadgeStatus = keyof typeof STATUS_BADGE_VARIANTS;

export function StatusBadge({
  status,
  className,
  ...props
}: {
  status?: StatusBadgeStatus;
  className?: string;
} & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx(
        'px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-[0.8px] whitespace-nowrap shrink-0 text-white',
        status ? STATUS_BADGE_VARIANTS[status] : '',
        className,
      )}
      {...props}
    />
  );
}

export function GameName({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx(
        'text-[15px] font-bold text-[var(--color)] opacity-[0.9] line-clamp-1',
        className,
      )}
      {...props}
    />
  );
}

export function RoomHeader({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx('flex flex-row items-center gap-4', className)}
      {...props}
    />
  );
}

export function RoomActions({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx('flex flex-row items-stretch gap-3 shrink-0', className)}
      {...props}
    />
  );
}

export function RoomMeta({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx('flex flex-col items-stretch w-full gap-4', className)}
      {...props}
    />
  );
}

export function MetaGrid({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'flex flex-row items-stretch flex-wrap gap-4 w-full',
        className,
      )}
      {...props}
    />
  );
}

export function MetaRow({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx('flex flex-row items-center gap-3 min-w-0', className)}
      {...props}
    />
  );
}

export function MetaIcon({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cx('text-[16px] opacity-[0.8]', className)} {...props} />
  );
}

export function MetaLabel({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx(
        'text-[12px] leading-[16px] font-medium text-[var(--color)] opacity-[0.5]',
        className,
      )}
      {...props}
    />
  );
}

export function MetaValue({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx(
        'text-[14px] leading-[18px] font-semibold text-[var(--color)] line-clamp-1',
        className,
      )}
      {...props}
    />
  );
}

export function ParticipantsLabel({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx(
        'text-[11px] leading-[14px] font-semibold uppercase tracking-[1px] text-[var(--color)] opacity-[0.5] mb-2',
        className,
      )}
      {...props}
    />
  );
}

export function FastBadge({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'flex flex-row items-center gap-1 px-3 py-1 rounded-lg bg-[var(--warning)] shadow-[0_4px_12px_rgba(245,158,11,0.4)] shrink-0',
        className,
      )}
      {...props}
    />
  );
}

export function RankedBadge({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'flex flex-row items-center gap-1 px-3 py-1 rounded-lg bg-[rgba(250,204,21,0.18)] border border-[#facc15] text-[#ffd700] shadow-[0_4px_12px_rgba(250,204,21,0.25)] shrink-0',
        className,
      )}
      {...props}
    />
  );
}

export function FastBadgeText({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx(
        'text-[10px] font-extrabold uppercase tracking-[0.8px] text-white',
        className,
      )}
      {...props}
    />
  );
}

export function BadgeIcon({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cx('mr-1 text-[12px]', className)} {...props} />;
}

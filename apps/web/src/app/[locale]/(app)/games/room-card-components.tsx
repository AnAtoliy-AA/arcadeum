import type { ReactNode } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';

export type RoomCardProps = {
  status?: 'completed';
  className?: string;
  'data-testid'?: string;
  children?: ReactNode;
};

export function RoomCard({
  status,
  className,
  'data-testid': dataTestId,
  children,
}: RoomCardProps) {
  return (
    <div
      data-testid={dataTestId}
      className={cx(
        'relative cursor-pointer border border-[var(--glassBorder)] bg-[var(--glassBg)]',
        status === 'completed' && 'border-[rgba(107,114,128,0.2)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

const STATUS_CHIP_VARIANTS = {
  lobby: {
    chip: 'bg-[color-mix(in_srgb,var(--success)_16%,transparent)] border-[color-mix(in_srgb,var(--success)_45%,transparent)]',
    dot: 'bg-[var(--success)]',
  },
  in_progress: {
    chip: 'bg-[color-mix(in_srgb,var(--warning)_16%,transparent)] border-[color-mix(in_srgb,var(--warning)_45%,transparent)]',
    dot: 'bg-[var(--warning)]',
  },
  completed: {
    chip: 'bg-[color-mix(in_srgb,var(--neutral)_16%,transparent)] border-[color-mix(in_srgb,var(--neutral)_45%,transparent)]',
    dot: 'bg-[var(--neutral)]',
  },
} as const;

export type StatusBadgeStatus = keyof typeof STATUS_CHIP_VARIANTS;

/** Status chip: tinted pill with a leading dot (readable in every theme). */
export function StatusBadge({
  status,
  className,
  children,
}: {
  status?: StatusBadgeStatus;
  className?: string;
  children?: ReactNode;
}) {
  const variant = status ? STATUS_CHIP_VARIANTS[status] : undefined;
  return (
    <span
      data-status={status}
      className={cx(
        'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-[var(--glassBorder)] px-2.5 py-1 text-xs font-semibold text-[var(--color)]',
        variant?.chip,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cx('h-2 w-2 rounded-full', variant?.dot)}
      />
      {children}
    </span>
  );
}

export function GameName({
  gradient,
  className,
  children,
}: {
  gradient?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <span
      style={gradient ? { backgroundImage: gradient } : undefined}
      className={cx(
        'text-xs font-semibold uppercase tracking-[0.06em] text-[var(--textSecondary)] opacity-100 truncate',
        gradient ? 'text-gradient' : undefined,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function RoomHeader({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cx('flex flex-row items-center gap-4', className)}>
      {children}
    </div>
  );
}

export function RoomActions({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cx('flex flex-row items-stretch gap-2 shrink-0', className)}
    >
      {children}
    </div>
  );
}

export function RoomMeta({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cx('flex flex-col items-stretch w-full gap-4', className)}>
      {children}
    </div>
  );
}

export function MetaGrid({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cx(
        'flex flex-row items-stretch flex-wrap gap-4 w-full',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function MetaRow({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cx('flex flex-row items-center gap-3 min-w-0', className)}>
      {children}
    </div>
  );
}

export function MetaIcon({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <span className={cx('text-[16px] opacity-[0.95]', className)}>
      {children}
    </span>
  );
}

export function MetaLabel({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <span
      className={cx(
        'text-[12px] leading-[16px] font-medium text-[var(--color)] opacity-[0.85]',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function MetaValue({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <span
      className={cx(
        'text-[14px] leading-[18px] font-semibold text-[var(--color)] line-clamp-1',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ParticipantsLabel({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <span
      className={cx(
        'text-[11px] leading-[14px] font-semibold uppercase tracking-[1px] text-[var(--color)] opacity-[0.85] mb-2',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function FastBadge({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cx(
        'flex flex-row items-center gap-1 px-3 py-1 rounded-lg bg-[var(--warning)] shadow-[0_4px_12px_rgba(245,158,11,0.4)] shrink-0',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function RankedBadge({
  className,
  'data-testid': dataTestId,
  children,
}: {
  className?: string;
  'data-testid'?: string;
  children?: ReactNode;
}) {
  return (
    <div
      data-testid={dataTestId}
      className={cx(
        'flex flex-row items-center gap-1 px-3 py-1 rounded-lg bg-[rgba(250,204,21,0.18)] border border-[#facc15] text-[#ffd700] shadow-[0_4px_12px_rgba(250,204,21,0.25)] shrink-0',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AiVsAiBadge({
  className,
  'data-testid': dataTestId,
  children,
}: {
  className?: string;
  'data-testid'?: string;
  children?: ReactNode;
}) {
  return (
    <div
      data-testid={dataTestId}
      className={cx(
        'flex flex-row items-center gap-1 px-3 py-1 rounded-lg bg-[rgba(99,102,241,0.18)] border border-[#818cf8] text-[#a5b4fc] shadow-[0_4px_12px_rgba(99,102,241,0.25)] shrink-0',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function FastBadgeText({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <span
      className={cx(
        'text-[10px] font-extrabold uppercase tracking-[0.8px] text-white',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function BadgeIcon({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return <span className={cx('mr-1 text-[12px]', className)}>{children}</span>;
}

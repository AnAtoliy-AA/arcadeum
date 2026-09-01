import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';

type DivClickHandler = MouseEventHandler<HTMLDivElement>;
type SpanClickHandler = MouseEventHandler<HTMLSpanElement>;

export function PlayerCard({
  isActive = false,
  className,
  children,
}: {
  isActive?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cx(
        'flex min-w-0 flex-1 flex-col items-stretch gap-2 rounded-xl p-3.5 backdrop-blur-[12px] transition-all duration-300',
        isActive
          ? 'border border-[rgba(34,197,94,0.4)] bg-[rgba(34,197,94,0.08)]'
          : 'border border-[var(--glassBorder)] bg-[var(--glassBg)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PlayerAvatar({
  className,
  style,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <div
      className={cx(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}

export function PlayerName({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <span
      className={cx(
        'truncate text-[13px] font-bold text-[#f8fafc] whitespace-nowrap',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function PlayerRating({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <span className={cx('text-[11px] text-[rgba(148,163,184,0.8)]', className)}>
      {children}
    </span>
  );
}

export function EvalBarContainer({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cx(
        'relative h-full min-h-[200px] w-6 shrink-0 overflow-hidden rounded-md border border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.3)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ClockContainer({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cx('flex w-full flex-row items-stretch gap-2', className)}>
      {children}
    </div>
  );
}

export function ClockFace({
  isActive = false,
  className,
  children,
}: {
  isActive?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cx(
        'flex flex-1 flex-col items-center rounded-lg px-3 py-2 transition-all duration-300',
        isActive
          ? 'border border-[rgba(59,130,246,0.5)] bg-[rgba(37,99,235,0.12)]'
          : 'border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ClockTime({
  isLow = false,
  isCritical = false,
  className,
  children,
}: {
  isLow?: boolean;
  isCritical?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <span
      className={cx(
        'text-[18px] font-bold text-[#f8fafc]',
        isCritical ? 'text-[#ef4444]' : isLow ? 'text-[#eab308]' : '',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ClockLabel({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <span
      className={cx(
        'mt-0.5 text-[9px] font-semibold uppercase text-[rgba(148,163,184,0.6)]',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ModalOverlay({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cx(
        'fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(0,0,0,0.6)] backdrop-blur-[8px]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ModalContent({
  className,
  style,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <div
      className={cx(
        'flex flex-col items-center gap-5 rounded-2xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-7 backdrop-blur-[20px]',
        className,
      )}
      style={{
        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export const PromotionModal = ModalContent;

export function ModalTitle({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <span
      className={cx('text-[18px] font-bold text-[var(--color)]', className)}
    >
      {children}
    </span>
  );
}

export function PromotionGrid({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cx(
        'flex flex-row items-stretch justify-center gap-3',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PromotionOption({
  className,
  onClick,
  children,
}: {
  className?: string;
  onClick?: DivClickHandler;
  children?: ReactNode;
}) {
  return (
    <div
      className={cx(
        'flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-xl border border-[var(--glassBorder)] bg-[var(--glassBg)] transition-all duration-150 hover:scale-[1.08] hover:border-indigo-400 hover:bg-[var(--glassBgHover)]',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function ModalButton({
  className,
  onClick,
  children,
}: {
  className?: string;
  onClick?: SpanClickHandler;
  children?: ReactNode;
}) {
  return (
    <span
      className={cx(
        'cursor-pointer rounded-lg px-6 py-2.5 text-[14px] font-semibold text-[#fff] transition-all duration-150 hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(99,102,241,0.4)]',
        className,
      )}
      style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
      onClick={onClick}
    >
      {children}
    </span>
  );
}

export function CancelButton({
  className,
  onClick,
  children,
}: {
  className?: string;
  onClick?: SpanClickHandler;
  children?: ReactNode;
}) {
  return (
    <span
      className={cx(
        'cursor-pointer rounded-lg border border-[var(--glassBorder)] bg-[var(--glassBg)] px-5 py-2 text-[13px] font-semibold text-[var(--textSecondary)] transition-colors duration-150 hover:bg-[var(--glassBgHover)]',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </span>
  );
}

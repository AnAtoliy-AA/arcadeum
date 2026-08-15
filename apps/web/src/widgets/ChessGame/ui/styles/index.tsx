import type { HTMLAttributes } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';

type DivProps = HTMLAttributes<HTMLDivElement> & { className?: string };
type SpanProps = HTMLAttributes<HTMLSpanElement> & { className?: string };

export function Square({
  isLight = false,
  isSelected = false,
  isCheck = false,
  isLastMove = false,
  isLegalTarget = false,
  className,
  ...props
}: DivProps & {
  isLight?: boolean;
  isSelected?: boolean;
  isCheck?: boolean;
  isLastMove?: boolean;
  isLegalTarget?: boolean;
}) {
  return (
    <div
      className={cx(
        'relative flex flex-1 aspect-square items-center justify-center overflow-hidden transition-colors duration-150',
        isLight ? 'bg-[rgba(120,140,160,0.25)]' : 'bg-[rgba(40,55,75,0.7)]',
        isSelected && 'bg-[rgba(255,215,0,0.25)] chess-square-selected',
        isCheck && 'bg-[rgba(239,68,68,0.3)] chess-square-check',
        isLastMove && 'bg-[rgba(56,189,248,0.18)] chess-square-last-move',
        isLegalTarget && 'cursor-pointer',
        className,
      )}
      {...props}
    />
  );
}

export function Piece({ className, ...props }: SpanProps) {
  return (
    <span
      className={cx(
        'relative z-[3] leading-none select-none transition-transform duration-200 ease-out hover:-translate-y-[3px]',
        className,
      )}
      style={{
        filter:
          'drop-shadow(0 2px 3px rgba(0,0,0,0.35)) drop-shadow(0 4px 6px rgba(0,0,0,0.2))',
      }}
      {...props}
    />
  );
}

export function RankLabel({ className, ...props }: SpanProps) {
  return (
    <span
      className={cx(
        'absolute right-[3px] top-0.5 z-[4] text-[10px] font-semibold leading-none opacity-[0.35] pointer-events-none',
        className,
      )}
      {...props}
    />
  );
}

export function FileLabel({ className, ...props }: SpanProps) {
  return (
    <span
      className={cx(
        'flex-1 pt-1 text-center text-[11px] font-medium opacity-[0.4]',
        className,
      )}
      {...props}
    />
  );
}

export function PlayerCard({
  isActive = false,
  className,
  ...props
}: DivProps & { isActive?: boolean }) {
  return (
    <div
      className={cx(
        'flex min-w-0 flex-1 flex-col items-stretch gap-2 rounded-xl p-3.5 backdrop-blur-[12px] transition-all duration-300',
        isActive
          ? 'border border-[rgba(34,197,94,0.4)] bg-[rgba(34,197,94,0.08)]'
          : 'border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)]',
        className,
      )}
      {...props}
    />
  );
}

export function PlayerAvatar({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
        className,
      )}
      {...props}
    />
  );
}

export function PlayerName({ className, ...props }: SpanProps) {
  return (
    <span
      className={cx(
        'truncate text-[13px] font-bold text-[#f8fafc] whitespace-nowrap',
        className,
      )}
      {...props}
    />
  );
}

export function PlayerRating({ className, ...props }: SpanProps) {
  return (
    <span
      className={cx('text-[11px] text-[rgba(148,163,184,0.8)]', className)}
      {...props}
    />
  );
}

export function EvalBarContainer({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        'relative h-full min-h-[200px] w-6 shrink-0 overflow-hidden rounded-md border border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.3)]',
        className,
      )}
      {...props}
    />
  );
}

export function ClockContainer({ className, ...props }: DivProps) {
  return (
    <div
      className={cx('flex w-full flex-row items-stretch gap-2', className)}
      {...props}
    />
  );
}

export function ClockFace({
  isActive = false,
  className,
  ...props
}: DivProps & { isActive?: boolean }) {
  return (
    <div
      className={cx(
        'flex flex-1 flex-col items-center rounded-lg px-3 py-2 transition-all duration-300',
        isActive
          ? 'border border-[rgba(59,130,246,0.5)] bg-[rgba(37,99,235,0.12)]'
          : 'border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)]',
        className,
      )}
      {...props}
    />
  );
}

export function ClockTime({
  isLow = false,
  isCritical = false,
  className,
  ...props
}: SpanProps & { isLow?: boolean; isCritical?: boolean }) {
  return (
    <span
      className={cx(
        'text-[18px] font-bold text-[#f8fafc]',
        isCritical ? 'text-[#ef4444]' : isLow ? 'text-[#eab308]' : '',
        className,
      )}
      {...props}
    />
  );
}

export function ClockLabel({ className, ...props }: SpanProps) {
  return (
    <span
      className={cx(
        'mt-0.5 text-[9px] font-semibold uppercase text-[rgba(148,163,184,0.6)]',
        className,
      )}
      {...props}
    />
  );
}

export function ModalOverlay({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        'fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(0,0,0,0.6)] backdrop-blur-[8px]',
        className,
      )}
      {...props}
    />
  );
}

export function ModalContent({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        'flex flex-col items-center gap-5 rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(20,24,32,0.95)] p-7 backdrop-blur-[20px]',
        className,
      )}
      style={{ boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5)' }}
      {...props}
    />
  );
}

export function ModalTitle({ className, ...props }: SpanProps) {
  return (
    <span
      className={cx('text-[18px] font-bold text-[#f8fafc]', className)}
      {...props}
    />
  );
}

export function PromotionGrid({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        'flex flex-row items-stretch justify-center gap-3',
        className,
      )}
      {...props}
    />
  );
}

export function PromotionOption({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        'flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] transition-all duration-150 hover:scale-[1.08] hover:border-[rgba(167,139,250,0.5)] hover:bg-[rgba(255,255,255,0.12)]',
        className,
      )}
      {...props}
    />
  );
}

export function ModalButton({ className, ...props }: SpanProps) {
  return (
    <span
      className={cx(
        'cursor-pointer rounded-lg px-6 py-2.5 text-[14px] font-semibold text-[#fff] transition-all duration-150 hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(99,102,241,0.4)]',
        className,
      )}
      style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
      {...props}
    />
  );
}

export function CancelButton({ className, ...props }: SpanProps) {
  return (
    <span
      className={cx(
        'cursor-pointer rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-5 py-2 text-[13px] font-semibold text-[rgba(148,163,184,0.8)] transition-colors duration-150 hover:bg-[rgba(255,255,255,0.1)]',
        className,
      )}
      {...props}
    />
  );
}

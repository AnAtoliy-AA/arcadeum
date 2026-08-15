import type { HTMLAttributes } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';

export const ACCENT_PINK = '#EC4899';
export const ACCENT_AMBER = '#F59E0B';
export const ACCENT_GRADIENT = `linear-gradient(135deg, ${ACCENT_PINK}, ${ACCENT_AMBER})`;

export const SYS_COLOR: Record<'elim' | 'round' | 'combo' | 'join', string> = {
  elim: '#F87171',
  round: '#22D3EE',
  combo: '#F59E0B',
  join: '#34D399',
};

type DivProps = HTMLAttributes<HTMLDivElement> & { className?: string };
type SpanProps = HTMLAttributes<HTMLSpanElement> & { className?: string };

export function Panel({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        'relative h-full w-full min-h-[360px] overflow-hidden rounded-[18px] border border-[var(--glassBorder)] bg-[var(--glassBg)]',
        className,
      )}
      {...props}
    />
  );
}

export function Head({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        'flex flex-col items-stretch gap-[10px] border-b border-[var(--glassBorder)] px-3 pt-3 pb-2.5',
        className,
      )}
      {...props}
    />
  );
}

export function HeadRow({ className, ...props }: DivProps) {
  return (
    <div
      className={cx('flex flex-row items-center gap-2', className)}
      {...props}
    />
  );
}

export function TitleDot({ className, ...props }: DivProps) {
  return (
    <div
      className={cx('h-[7px] w-[7px] rounded-full bg-[#34D399]', className)}
      style={{ boxShadow: '0 0 8px #34D399' }}
      {...props}
    />
  );
}

export function Title({ className, ...props }: SpanProps) {
  return (
    <span
      className={cx(
        'text-[13px] font-semibold tracking-[0.2px] text-[var(--color)]',
        className,
      )}
      {...props}
    />
  );
}

export function TabsRow({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        'flex flex-row items-center gap-0.5 rounded-full border border-[var(--glassBorder)] bg-[var(--backgroundHover)] p-[3px]',
        className,
      )}
      {...props}
    />
  );
}

export function Tab({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        'flex flex-1 cursor-pointer flex-row items-center justify-center gap-1.5 rounded-full px-2.5 py-[5px] hover:bg-[var(--backgroundHover)]',
        className,
      )}
      {...props}
    />
  );
}

export function TabLabel({ className, ...props }: SpanProps) {
  return (
    <span
      className={cx(
        'text-[11.5px] font-semibold text-[rgba(180,180,200,0.7)]',
        className,
      )}
      {...props}
    />
  );
}

export function TabCount({ className, ...props }: SpanProps) {
  return (
    <span
      className={cx(
        'min-w-[16px] rounded-full bg-[var(--backgroundHover)] px-1 py-0.5 text-center text-[9.5px] text-[rgba(180,180,200,0.7)]',
        className,
      )}
      {...props}
    />
  );
}

export function Body({ className, ...props }: DivProps) {
  return (
    <div
      className={cx('flex min-h-0 flex-1 flex-col items-stretch', className)}
      {...props}
    />
  );
}

export function ListGap({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        'flex flex-col items-stretch gap-[10px] px-3.5 pt-1 pb-1.5',
        className,
      )}
      {...props}
    />
  );
}

export function Divider({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        'flex flex-row items-center justify-center py-1',
        className,
      )}
      {...props}
    />
  );
}

export function DividerLabel({ className, ...props }: SpanProps) {
  return (
    <span
      className={cx(
        'px-2.5 text-[9.5px] font-bold uppercase tracking-[1.2px] text-[rgba(180,180,200,0.7)]',
        className,
      )}
      {...props}
    />
  );
}

export function Foot({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        'flex flex-col items-stretch gap-2 border-t border-[var(--glassBorder)] px-3.5 pt-2.5 pb-3',
        className,
      )}
      {...props}
    />
  );
}

export function QuickRow({ className, ...props }: DivProps) {
  return (
    <div
      className={cx('flex flex-row items-stretch gap-1.5 flex-wrap', className)}
      {...props}
    />
  );
}

export function QuickButton({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        'flex h-6 cursor-pointer flex-row items-center gap-1 rounded-full border border-[var(--glassBorder)] bg-[var(--backgroundHover)] px-2.5 hover:bg-[var(--backgroundPress)]',
        className,
      )}
      {...props}
    />
  );
}

export function QuickButtonText({ className, ...props }: SpanProps) {
  return (
    <span
      className={cx('text-[11px] font-medium text-[var(--color)]', className)}
      {...props}
    />
  );
}

export function InputPill({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        'flex h-[38px] flex-row items-center gap-2 rounded-xl border border-[var(--glassBorder)] bg-[var(--backgroundHover)] pl-3 pr-1',
        className,
      )}
      {...props}
    />
  );
}

export function ChannelChip({ className, ...props }: SpanProps) {
  return (
    <span
      className={cx(
        'border-r border-[var(--glassBorder)] pr-2 text-[10px] font-bold uppercase tracking-[1px]',
        className,
      )}
      {...props}
    />
  );
}

export function MetaLine({ className, ...props }: DivProps) {
  return (
    <div
      className={cx('flex flex-row items-center justify-between', className)}
      {...props}
    />
  );
}

export function MetaText({ className, ...props }: SpanProps) {
  return (
    <span
      className={cx(
        'text-[9.5px] uppercase tracking-[0.8px] text-[rgba(180,180,200,0.7)]',
        className,
      )}
      {...props}
    />
  );
}

export function CollapsedShell({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        'flex h-11 w-full cursor-pointer flex-row items-center gap-2 rounded-full border border-[var(--glassBorder)] bg-[var(--glassBg)] px-3 hover:border-[var(--glassBorderHover)]',
        className,
      )}
      {...props}
    />
  );
}

export function CollapsedPreview({ className, ...props }: SpanProps) {
  return (
    <span
      className={cx(
        'flex-1 truncate text-[12px] text-[rgba(180,180,200,0.7)]',
        className,
      )}
      {...props}
    />
  );
}

export function UnreadBadge({ className, ...props }: SpanProps) {
  return (
    <span
      className={cx(
        'rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[0.4px] text-[#06011b]',
        className,
      )}
      {...props}
    />
  );
}

export function SysWrap({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        'flex flex-row items-center gap-2 rounded-[10px] border-l-2 border-l-[rgba(255,255,255,0.18)] px-2.5 py-[7px]',
        className,
      )}
      {...props}
    />
  );
}

export function SysText({ className, ...props }: SpanProps) {
  return (
    <span
      className={cx('flex-1 text-[11px] text-[var(--color)]', className)}
      {...props}
    />
  );
}

export function SysTime({ className, ...props }: SpanProps) {
  return (
    <span
      className={cx('text-[10px] text-[rgba(180,180,200,0.7)]', className)}
      {...props}
    />
  );
}

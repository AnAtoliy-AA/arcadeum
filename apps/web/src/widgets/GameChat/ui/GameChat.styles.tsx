import type {
  AriaRole,
  CSSProperties,
  MouseEventHandler,
  ReactNode,
} from 'react';
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

interface DivProps {
  className?: string;
  children?: ReactNode;
}

interface SpanProps {
  className?: string;
  children?: ReactNode;
}

export function Panel({
  className,
  children,
  'data-testid': testId,
}: DivProps & { 'data-testid'?: string }) {
  return (
    <div
      className={cx(
        'relative flex h-full w-full min-h-[360px] flex-col items-stretch overflow-hidden rounded-[18px] border border-[var(--glassBorderStrong)] bg-[var(--glassBg)]',
        className,
      )}
      data-testid={testId}
    >
      {children}
    </div>
  );
}

export function Head({ className, children }: DivProps) {
  return (
    <div
      className={cx(
        'flex flex-col items-stretch gap-[10px] border-b border-[var(--glassBorderStrong)] px-3 pt-3 pb-2.5',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function HeadRow({ className, children }: DivProps) {
  return (
    <div className={cx('flex flex-row items-center gap-2', className)}>
      {children}
    </div>
  );
}

export function TitleDot() {
  return (
    <div
      className="h-[7px] w-[7px] rounded-full bg-[#34D399]"
      style={{ boxShadow: '0 0 8px #34D399' }}
    />
  );
}

export function Title({ className, children }: SpanProps) {
  return (
    <span
      className={cx(
        'text-[13px] font-semibold tracking-[0.2px] text-[var(--color)]',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function TabsRow({
  className,
  children,
  role,
}: DivProps & { role?: AriaRole }) {
  return (
    <div
      className={cx(
        'flex flex-row items-center gap-0.5 rounded-full border border-[var(--glassBorder)] bg-[var(--backgroundHover)] p-[3px]',
        className,
      )}
      role={role}
    >
      {children}
    </div>
  );
}

export function Tab({
  className,
  children,
  role,
  ariaSelected,
  onClick,
  style,
}: DivProps & {
  role?: AriaRole;
  ariaSelected?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cx(
        'flex flex-1 cursor-pointer flex-row items-center justify-center gap-1.5 rounded-full px-2.5 py-[5px] hover:bg-[var(--backgroundHover)]',
        className,
      )}
      role={role}
      aria-selected={ariaSelected}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
}

export function TabLabel({
  className,
  children,
  color,
}: SpanProps & { color?: string }) {
  return (
    <span
      className={cx(
        'text-[11.5px] font-semibold text-[rgba(180,180,200,0.7)]',
        className,
      )}
      style={color ? { color } : undefined}
    >
      {children}
    </span>
  );
}

export function TabCount({
  className,
  children,
  style,
}: SpanProps & { style?: CSSProperties }) {
  return (
    <span
      className={cx(
        'min-w-[16px] rounded-full bg-[var(--backgroundHover)] px-1 py-0.5 text-center text-[9.5px] text-[rgba(180,180,200,0.7)]',
        className,
      )}
      style={style}
    >
      {children}
    </span>
  );
}

export function Body({ className, children }: DivProps) {
  return (
    <div
      className={cx('flex min-h-0 flex-1 flex-col items-stretch', className)}
    >
      {children}
    </div>
  );
}

export function ListGap({
  className,
  children,
  role,
  ariaLive,
  ariaRelevant,
}: DivProps & {
  role?: AriaRole;
  ariaLive?: 'off' | 'assertive' | 'polite';
  ariaRelevant?: 'additions' | 'additions text' | 'all' | 'removals' | 'text';
}) {
  return (
    <div
      className={cx(
        'flex flex-col items-stretch gap-[10px] px-3.5 pt-1 pb-1.5',
        className,
      )}
      role={role}
      aria-live={ariaLive}
      aria-relevant={ariaRelevant}
    >
      {children}
    </div>
  );
}

export function Divider({ className, children }: DivProps) {
  return (
    <div
      className={cx(
        'flex flex-row items-center justify-center py-1',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DividerLabel({
  className,
  children,
  style,
}: SpanProps & { style?: CSSProperties }) {
  return (
    <span
      className={cx(
        'px-2.5 text-[9.5px] font-bold uppercase tracking-[1.2px] text-[rgba(180,180,200,0.7)]',
        className,
      )}
      style={style}
    >
      {children}
    </span>
  );
}

export function Foot({ className, children }: DivProps) {
  return (
    <div
      className={cx(
        'flex flex-col items-stretch gap-2 border-t border-[var(--glassBorderStrong)] px-3.5 pt-2.5 pb-3',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function QuickRow({
  className,
  children,
  role,
  'aria-label': ariaLabel,
}: DivProps & { role?: AriaRole; 'aria-label'?: string }) {
  return (
    <div
      className={cx('flex flex-row items-stretch gap-1.5 flex-wrap', className)}
      role={role}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}

export function QuickButton({
  className,
  children,
  onClick,
  ariaLabel,
}: DivProps & {
  onClick?: MouseEventHandler<HTMLDivElement>;
  ariaLabel?: string;
}) {
  return (
    <div
      className={cx(
        'flex h-6 cursor-pointer flex-row items-center gap-1 rounded-full border border-[var(--glassBorder)] bg-[var(--backgroundHover)] px-2.5 hover:bg-[var(--backgroundPress)]',
        className,
      )}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}

export function QuickButtonText({ className, children }: SpanProps) {
  return (
    <span
      className={cx('text-[11px] font-medium text-[var(--color)]', className)}
    >
      {children}
    </span>
  );
}

export function InputPill({
  className,
  children,
  style,
}: DivProps & { style?: CSSProperties }) {
  return (
    <div
      className={cx(
        'flex h-[38px] flex-row items-center gap-2 rounded-xl border border-[var(--glassBorder)] bg-[var(--backgroundHover)] pl-3 pr-1',
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}

export function ChannelChip({
  className,
  children,
  style,
  color,
}: SpanProps & { style?: CSSProperties; color?: string }) {
  return (
    <span
      className={cx(
        'border-r border-[var(--glassBorder)] pr-2 text-[10px] font-bold uppercase tracking-[1px]',
        className,
      )}
      style={color ? { ...style, color } : style}
    >
      {children}
    </span>
  );
}

export function MetaLine({ className, children }: DivProps) {
  return (
    <div
      className={cx('flex flex-row items-center justify-between', className)}
    >
      {children}
    </div>
  );
}

export function MetaText({
  className,
  children,
  style,
}: SpanProps & { style?: CSSProperties }) {
  return (
    <span
      className={cx(
        'text-[9.5px] uppercase tracking-[0.8px] text-[rgba(180,180,200,0.7)]',
        className,
      )}
      style={style}
    >
      {children}
    </span>
  );
}

export function CollapsedShell({
  className,
  children,
  role,
  'aria-label': ariaLabel,
  onClick,
}: DivProps & {
  role?: AriaRole;
  'aria-label'?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
}) {
  return (
    <div
      className={cx(
        'flex h-11 w-full cursor-pointer flex-row items-center gap-2 rounded-full border border-[var(--glassBorderStrong)] bg-[var(--glassBg)] px-3 hover:border-[var(--glassBorderHover)]',
        className,
      )}
      role={role}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CollapsedPreview({ className, children }: SpanProps) {
  return (
    <span
      className={cx(
        'flex-1 truncate text-[12px] text-[rgba(180,180,200,0.7)]',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function UnreadBadge({
  className,
  children,
  style,
}: SpanProps & { style?: CSSProperties }) {
  return (
    <span
      className={cx(
        'rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[0.4px] text-[#06011b]',
        className,
      )}
      style={style}
    >
      {children}
    </span>
  );
}

export function SysWrap({
  className,
  children,
  style,
  'data-testid': testId,
}: DivProps & { style?: CSSProperties; 'data-testid'?: string }) {
  return (
    <div
      className={cx(
        'flex flex-row items-center gap-2 rounded-[10px] border-l-2 border-l-[rgba(255,255,255,0.18)] px-2.5 py-[7px]',
        className,
      )}
      style={style}
      data-testid={testId}
    >
      {children}
    </div>
  );
}

export function SysText({
  className,
  children,
  style,
  'data-testid': testId,
}: SpanProps & { style?: CSSProperties; 'data-testid'?: string }) {
  return (
    <span
      className={cx('flex-1 text-[11px] text-[var(--color)]', className)}
      style={style}
      data-testid={testId}
    >
      {children}
    </span>
  );
}

export function SysTime({ className, children }: SpanProps) {
  return (
    <span className={cx('text-[10px] text-[rgba(180,180,200,0.7)]', className)}>
      {children}
    </span>
  );
}

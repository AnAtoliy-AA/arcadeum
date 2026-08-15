import { cx } from '@arcadeum/ui/utils/cx';
import type { HTMLAttributes } from 'react';

// ─── Class name constants ─────────────────────────────────────────────────────
export const GAME_TILE_CLASS = 'games-create-tile';
export const SELECTION_INDICATOR_CLASS = 'games-create-selection-indicator';
export const GAME_TILE_ICON_CLASS = 'games-create-tile-icon';

type DivProps = HTMLAttributes<HTMLDivElement> & { className?: string };
type SpanProps = HTMLAttributes<HTMLSpanElement> & { className?: string };
type ButtonHTMLAttributes = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function GameTileItem({
  active,
  disabled,
  className,
  ...props
}: DivProps & { active?: boolean; disabled?: boolean }) {
  return (
    <div
      className={cx(
        'box-border relative flex w-full cursor-pointer flex-col gap-1.5 overflow-hidden rounded-xl border-2 border-[var(--borderColor)] bg-[rgba(255,255,255,0.03)] p-4 transition-colors duration-150 active:bg-[rgba(122,215,255,0.05)] active:border-[#7ad7ff]',
        active && 'bg-[rgba(122,215,255,0.05)] border-[#7ad7ff]',
        disabled && 'cursor-not-allowed opacity-[0.6]',
        className,
      )}
      {...props}
    />
  );
}

export function GameTileContainer({
  disabled,
  className,
  ...props
}: ButtonHTMLAttributes & { className?: string; disabled?: boolean }) {
  void disabled;
  return (
    <button
      type="button"
      className={cx(
        'box-border block h-auto w-full cursor-pointer border-0 bg-transparent p-0 transition-all duration-150 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] active:bg-transparent',
        className,
      )}
      {...props}
    />
  );
}

// ─── Simple layout components ─────────────────────────────────────────────────

export function FormContainer({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        'box-border flex flex-col items-stretch gap-5 max-[660px]:pb-24',
        className,
      )}
      {...props}
    />
  );
}

export function StickyMobileCta({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        'box-border flex flex-col items-stretch max-[660px]:fixed max-[660px]:left-0 max-[660px]:right-0 max-[660px]:bottom-0 max-[660px]:z-[150] max-[660px]:border-t max-[660px]:border-[rgba(255,255,255,0.12)] max-[660px]:bg-[rgba(15,23,42,0.92)] max-[660px]:p-3 max-[660px]:backdrop-blur-[16px]',
        className,
      )}
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
      {...props}
    />
  );
}

export function GameSelector({ className, ...props }: DivProps) {
  return (
    <div
      className={cx('box-border grid gap-4', className)}
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}
      {...props}
    />
  );
}

export function SelectionIndicator({
  active,
  className,
  ...props
}: SpanProps & { active?: boolean }) {
  return (
    <span
      className={cx(
        'box-border absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primaryGradientStart)] transition-all duration-150',
        active ? 'scale-100 opacity-100' : 'scale-[0.5] opacity-0',
        className,
      )}
      {...props}
    />
  );
}

export function GameTileIcon({ className, ...props }: SpanProps) {
  return (
    <span
      className={cx(
        'box-border mb-3 flex text-[32px] leading-[38px] transition-transform duration-150 group-hover:scale-110',
        className,
      )}
      {...props}
    />
  );
}

export function GameTileName({ className, ...props }: SpanProps) {
  return (
    <span
      className={cx(
        'box-border text-[18px] font-bold text-[var(--color)]',
        className,
      )}
      {...props}
    />
  );
}

export function GameTileSummary({ className, ...props }: SpanProps) {
  return (
    <span
      className={cx(
        'box-border text-[14px] leading-[22px] opacity-[0.65] text-[var(--color)]',
        className,
      )}
      {...props}
    />
  );
}

export function ComingSoonBadge({ className, ...props }: SpanProps) {
  return (
    <span
      className={cx(
        'box-border absolute right-3 top-3 rounded border border-[var(--borderColor)] bg-[var(--background)] px-2 py-1 text-[10px] font-bold uppercase tracking-wide opacity-[0.5] text-[var(--color)]',
        className,
      )}
      {...props}
    />
  );
}

// $xs = max-width:660px
export function Row({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-stretch gap-4 max-[660px]:flex-col',
        className,
      )}
      {...props}
    />
  );
}

export function ExpansionGrid({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-stretch gap-3 flex-wrap',
        className,
      )}
      {...props}
    />
  );
}

export function ExpansionCheckbox({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-center cursor-pointer gap-3 rounded-lg border border-[var(--borderColor)] bg-[var(--background)] px-4 py-3 transition-all duration-200',
        className,
      )}
      {...props}
    />
  );
}

export function ExpansionLabel({ className, ...props }: SpanProps) {
  return (
    <span
      className={cx('box-border flex-1 text-[14px] font-medium', className)}
      {...props}
    />
  );
}

export function ExpansionBadge({ className, ...props }: SpanProps) {
  return (
    <span
      className={cx(
        'box-border rounded-xl bg-[rgba(255,255,255,0.05)] px-2 py-0.5 text-[12px] opacity-[0.5] text-[var(--color)]',
        className,
      )}
      {...props}
    />
  );
}

export function ExpandablePackContainer({ className, ...props }: DivProps) {
  return (
    <div
      className={cx('box-border flex flex-col items-stretch gap-2', className)}
      {...props}
    />
  );
}

export function ExpandablePackHeader({
  disabled,
  className,
  ...props
}: ButtonHTMLAttributes & { className?: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      className={cx(
        'box-border flex h-auto w-full cursor-pointer flex-row items-center gap-3 justify-start rounded-lg border border-[var(--borderColor)] bg-[var(--background)] p-3 transition-colors duration-150 hover:bg-[rgba(255,255,255,0.02)] active:bg-[rgba(255,255,255,0.05)]',
        disabled && 'cursor-not-allowed opacity-[0.5]',
        className,
      )}
      {...props}
    />
  );
}

export function ExpandToggle({
  expanded,
  className,
  ...props
}: SpanProps & { expanded?: boolean }) {
  return (
    <span
      className={cx(
        'box-border inline-block text-[14px] leading-[18px] text-[rgba(180,180,200,0.7)] transition-transform duration-150',
        expanded && 'rotate-180',
        className,
      )}
      {...props}
    />
  );
}

export function PackCardList({
  visible,
  className,
  ...props
}: DivProps & { visible?: boolean }) {
  return (
    <div
      className={cx(
        'box-border flex flex-col items-stretch gap-2 pb-4 pl-8 pr-4',
        visible ? 'flex' : 'hidden',
        className,
      )}
      {...props}
    />
  );
}

export function PackCardRow({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-center cursor-pointer gap-2 rounded-md bg-[var(--background)] px-3 py-2 transition-colors duration-150 hover:bg-[rgba(255,255,255,0.03)]',
        className,
      )}
      {...props}
    />
  );
}

export function PackCardName({ className, ...props }: SpanProps) {
  return (
    <span
      className={cx(
        'box-border flex-1 text-[13px] opacity-[0.7] text-[var(--color)]',
        className,
      )}
      {...props}
    />
  );
}

export function QuantityControl({ className, ...props }: DivProps) {
  return (
    <div
      className={cx('box-border flex flex-row items-center gap-1', className)}
      {...props}
    />
  );
}

export function QuantityValue({ className, ...props }: SpanProps) {
  return (
    <span
      className={cx(
        'box-border min-w-[24px] text-center text-[13px] font-semibold text-[var(--color)]',
        className,
      )}
      {...props}
    />
  );
}

export function SelectAllRow({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-center cursor-pointer gap-3 rounded-lg border border-[var(--borderColor)] bg-[var(--background)] px-4 py-3 mb-2 transition-all duration-200',
        className,
      )}
      {...props}
    />
  );
}

export function ThemeHeader({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-center justify-between mb-4',
        className,
      )}
      {...props}
    />
  );
}

import { cx } from '@arcadeum/ui/utils/cx';
import type { CSSProperties, ReactNode } from 'react';

// ─── Class name constants ─────────────────────────────────────────────────────
export const GAME_TILE_CLASS = 'games-create-tile';
export const SELECTION_INDICATOR_CLASS = 'games-create-selection-indicator';
export const GAME_TILE_ICON_CLASS = 'games-create-tile-icon';

interface BaseElementProps {
  className?: string;
  children?: ReactNode;
  id?: string;
  'data-testid'?: string;
  style?: CSSProperties;
  role?: string;
  'aria-label'?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

export function GameTileItem({
  active,
  disabled,
  className,
  id,
  'data-testid': dataTestId,
  style,
  role,
  'aria-label': ariaLabel,
  onClick,
  children,
}: BaseElementProps & { active?: boolean; disabled?: boolean }) {
  return (
    <div
      id={id}
      data-testid={dataTestId}
      style={style}
      role={role}
      aria-label={ariaLabel}
      onClick={onClick}
      className={cx(
        'relative flex w-full cursor-pointer flex-col gap-1.5 overflow-hidden rounded-xl border-2 border-[var(--borderColor)] bg-[rgba(255,255,255,0.03)] p-4 transition-colors duration-150 active:bg-[rgba(122,215,255,0.05)] active:border-[#7ad7ff]',
        active && 'bg-[rgba(122,215,255,0.05)] border-[#7ad7ff]',
        disabled && 'cursor-not-allowed opacity-[0.6]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function GameTileContainer({
  disabled,
  className,
  id,
  'data-testid': dataTestId,
  style,
  'aria-label': ariaLabel,
  onClick,
  children,
}: Omit<BaseElementProps, 'onClick'> & {
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}) {
  void disabled;
  return (
    <button
      type="button"
      id={id}
      data-testid={dataTestId}
      style={style}
      aria-label={ariaLabel}
      onClick={onClick}
      className={cx(
        'block h-auto w-full cursor-pointer border-0 bg-transparent p-0 transition-all duration-150 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] active:bg-transparent',
        className,
      )}
    >
      {children}
    </button>
  );
}

// ─── Simple layout components ─────────────────────────────────────────────────

export function FormContainer({ className, children }: BaseElementProps) {
  return (
    <div
      className={cx(
        'flex flex-col items-stretch gap-5 max-[660px]:pb-24',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StickyMobileCta({ className, children }: BaseElementProps) {
  return (
    <div
      className={cx(
        'flex flex-col items-stretch max-[660px]:fixed max-[660px]:left-0 max-[660px]:right-0 max-[660px]:bottom-0 max-[660px]:z-[150] max-[660px]:border-t max-[660px]:border-[rgba(255,255,255,0.12)] max-[660px]:bg-[rgba(15,23,42,0.92)] max-[660px]:p-3 max-[660px]:backdrop-blur-[16px]',
        className,
      )}
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
    >
      {children}
    </div>
  );
}

export function GameSelector({ className, children }: BaseElementProps) {
  return (
    <div
      className={cx('grid gap-4', className)}
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}
    >
      {children}
    </div>
  );
}

export function SelectionIndicator({
  active,
  className,
  id,
  'data-testid': dataTestId,
  role,
  'aria-label': ariaLabel,
  children,
}: Omit<BaseElementProps, 'style' | 'onClick'> & { active?: boolean }) {
  return (
    <span
      id={id}
      data-testid={dataTestId}
      role={role}
      aria-label={ariaLabel}
      className={cx(
        'absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primaryGradientStart)] transition-all duration-150',
        active ? 'scale-100 opacity-100' : 'scale-[0.5] opacity-0',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function GameTileIcon({ className, children }: BaseElementProps) {
  return (
    <span
      className={cx(
        'mb-3 flex text-[32px] leading-[38px] transition-transform duration-150 group-hover:scale-110',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function GameTileName({ className, children }: BaseElementProps) {
  return (
    <span
      className={cx('text-[18px] font-bold text-[var(--color)]', className)}
    >
      {children}
    </span>
  );
}

export function GameTileSummary({ className, children }: BaseElementProps) {
  return (
    <span
      className={cx(
        'text-[14px] leading-[22px] opacity-[0.65] text-[var(--color)]',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ComingSoonBadge({
  className,
  id,
  'data-testid': dataTestId,
  children,
}: Pick<BaseElementProps, 'className' | 'id' | 'data-testid' | 'children'>) {
  return (
    <span
      id={id}
      data-testid={dataTestId}
      className={cx(
        'absolute right-3 top-3 rounded border border-[var(--borderColor)] bg-[var(--background)] px-2 py-1 text-[10px] font-bold uppercase tracking-wide opacity-[0.5] text-[var(--color)]',
        className,
      )}
    >
      {children}
    </span>
  );
}

// $xs = max-width:660px
export function Row({ className, children }: BaseElementProps) {
  return (
    <div
      className={cx(
        'flex flex-row items-stretch gap-4 max-[660px]:flex-col',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ExpansionGrid({ className, children }: BaseElementProps) {
  return (
    <div
      className={cx('flex flex-row items-stretch gap-3 flex-wrap', className)}
    >
      {children}
    </div>
  );
}

export function ExpansionCheckbox({ className, children }: BaseElementProps) {
  return (
    <div
      className={cx(
        'flex flex-row items-center cursor-pointer gap-3 rounded-lg border border-[var(--borderColor)] bg-[var(--background)] px-4 py-3 transition-all duration-200',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ExpansionLabel({ className, children }: BaseElementProps) {
  return (
    <span className={cx('flex-1 text-[14px] font-medium', className)}>
      {children}
    </span>
  );
}

export function ExpansionBadge({ className, children }: BaseElementProps) {
  return (
    <span
      className={cx(
        'rounded-xl bg-[rgba(255,255,255,0.05)] px-2 py-0.5 text-[12px] opacity-[0.5] text-[var(--color)]',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ExpandablePackContainer({
  className,
  children,
}: BaseElementProps) {
  return (
    <div className={cx('flex flex-col items-stretch gap-2', className)}>
      {children}
    </div>
  );
}

export function ExpandablePackHeader({
  disabled,
  className,
  onClick,
  'aria-label': ariaLabel,
  children,
}: {
  disabled?: boolean;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  'aria-label'?: string;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={cx(
        'flex h-auto w-full cursor-pointer flex-row items-center gap-3 justify-start rounded-lg border border-[var(--borderColor)] bg-[var(--background)] p-3 transition-colors duration-150 hover:bg-[rgba(255,255,255,0.02)] active:bg-[rgba(255,255,255,0.05)]',
        disabled && 'cursor-not-allowed opacity-[0.5]',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function ExpandToggle({
  expanded,
  className,
  children,
}: {
  expanded?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <span
      className={cx(
        'inline-block text-[14px] leading-[18px] text-[rgba(180,180,200,0.7)] transition-transform duration-150',
        expanded && 'rotate-180',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function PackCardList({
  visible,
  className,
  children,
}: {
  visible?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cx(
        'flex flex-col items-stretch gap-2 pb-4 pl-8 pr-4',
        visible ? 'flex' : 'hidden',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PackCardRow({ className, children }: BaseElementProps) {
  return (
    <div
      className={cx(
        'flex flex-row items-center cursor-pointer gap-2 rounded-md bg-[var(--background)] px-3 py-2 transition-colors duration-150 hover:bg-[rgba(255,255,255,0.03)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PackCardName({ className, children }: BaseElementProps) {
  return (
    <span
      className={cx(
        'flex-1 text-[13px] opacity-[0.7] text-[var(--color)]',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function QuantityControl({ className, children }: BaseElementProps) {
  return (
    <div className={cx('flex flex-row items-center gap-1', className)}>
      {children}
    </div>
  );
}

export function QuantityValue({ className, children }: BaseElementProps) {
  return (
    <span
      className={cx(
        'min-w-[24px] text-center text-[13px] font-semibold text-[var(--color)]',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SelectAllRow({ className, children }: BaseElementProps) {
  return (
    <div
      className={cx(
        'flex flex-row items-center cursor-pointer gap-3 rounded-lg border border-[var(--borderColor)] bg-[var(--background)] px-4 py-3 mb-2 transition-all duration-200',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ThemeHeader({ className, children }: BaseElementProps) {
  return (
    <div
      className={cx(
        'flex flex-row items-center justify-between mb-4',
        className,
      )}
    >
      {children}
    </div>
  );
}

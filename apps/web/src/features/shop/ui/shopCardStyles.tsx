import { cx } from '@arcadeum/ui/utils/cx';
import type {
  CSSProperties,
  KeyboardEventHandler,
  FocusEventHandler,
  MouseEventHandler,
  PointerEventHandler,
  ReactNode,
} from 'react';

export function CardFrame({
  small,
  className,
  id,
  'data-testid': dataTestId,
  'data-rarity': dataRarity,
  'data-owned': dataOwned,
  'data-equipped': dataEquipped,
  'data-action': dataAction,
  style,
  onPointerEnter,
  onPointerLeave,
  children,
}: {
  small?: boolean;
  className?: string;
  id?: string;
  'data-testid'?: string;
  'data-rarity'?: string;
  'data-owned'?: string;
  'data-equipped'?: string;
  'data-action'?: string;
  style?: CSSProperties;
  onPointerEnter?: PointerEventHandler<HTMLDivElement>;
  onPointerLeave?: PointerEventHandler<HTMLDivElement>;
  children?: ReactNode;
}) {
  return (
    <div
      id={id}
      data-testid={dataTestId}
      data-rarity={dataRarity}
      data-owned={dataOwned}
      data-equipped={dataEquipped}
      data-action={dataAction}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      style={style}
      className={cx(
        'relative flex flex-col items-stretch shrink-0 overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] transition-all duration-150 hover:-translate-y-0.5 hover:border-[rgba(255,255,255,0.22)] hover:bg-[rgba(255,255,255,0.04)]',
        small ? 'w-[144px]' : 'w-[200px]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ArtBox({
  small,
  className,
  style,
  children,
}: {
  small?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <div
      style={style}
      className={cx(
        'relative flex items-center justify-center',
        small ? 'h-[96px]' : 'h-[140px]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Chip({
  backgroundColor,
  borderColor,
  className,
  children,
}: {
  backgroundColor?: string;
  borderColor?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cx(
        'rounded-lg border border-[var(--borderColor)] px-1.5 py-0.5',
        className,
      )}
      style={{ backgroundColor, borderColor }}
    >
      {children}
    </div>
  );
}

const ACTION_INTENT_CLASS = {
  buy: 'bg-[rgba(255,255,255,0.06)] border-[rgba(255,255,255,0.18)] hover:bg-[rgba(255,255,255,0.10)] hover:border-[rgba(255,255,255,0.30)]',
  equip:
    'bg-[rgba(16,185,129,0.12)] border-[rgba(34,197,94,0.45)] hover:bg-[rgba(16,185,129,0.20)] hover:border-[rgba(34,197,94,0.70)]',
  unequip:
    'bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.14)] hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.28)]',
} as const;

export function ActionButton({
  intent,
  affordable = true,
  pending = false,
  className,
  role,
  tabIndex,
  onClick,
  onKeyDown,
  onFocus,
  onBlur,
  style,
  'aria-disabled': ariaDisabled,
  'data-testid': dataTestId,
  'data-affordable': dataAffordable,
  children,
}: {
  intent: keyof typeof ACTION_INTENT_CLASS;
  affordable?: boolean;
  pending?: boolean;
  className?: string;
  role?: string;
  tabIndex?: number;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  onKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
  onFocus?: FocusEventHandler<HTMLButtonElement>;
  onBlur?: FocusEventHandler<HTMLButtonElement>;
  style?: CSSProperties;
  'aria-disabled'?: boolean;
  'data-testid'?: string;
  'data-affordable'?: string;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      role={role}
      tabIndex={tabIndex}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      aria-disabled={ariaDisabled}
      data-testid={dataTestId}
      data-affordable={dataAffordable}
      style={style}
      className={cx(
        'flex w-full cursor-pointer flex-row items-center justify-center gap-1.5 rounded-xl border px-4 py-2 transition-colors duration-150 focus:outline-2 focus:outline-[rgba(125,211,252,0.6)] focus:outline-offset-1 focus:outline-solid',
        ACTION_INTENT_CLASS[intent],
        !affordable && 'opacity-[0.7]',
        pending && 'opacity-[0.55]',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function uuid(): string {
  return globalThis.crypto.randomUUID();
}

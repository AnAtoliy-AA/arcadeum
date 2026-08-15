import type { HTMLAttributes } from 'react';

import { cx } from '@arcadeum/ui/utils/cx';

type VariantProp = { variant?: string };

export function CardNameContainer({
  className,
  variant,
  ...props
}: { className?: string } & VariantProp & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'flex flex-col items-stretch absolute top-0 left-0 right-0 px-2 py-[6px] rounded-t-[14px] z-[10] border-b border-b-[rgba(255,255,255,0.1)]',
        variant === 'cyberpunk'
          ? 'rounded-t-[4px] bg-[rgba(0,0,0,0.7)]'
          : 'bg-[rgba(0,0,0,0.45)]',
        className,
      )}
      style={{ backdropFilter: 'blur(8px)' }}
      {...props}
    />
  );
}

export function CardName({
  className,
  ...props
}: { className?: string } & VariantProp & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx(
        'text-[11px] font-extrabold uppercase tracking-[1px] text-white text-center line-clamp-1 [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]',
        className,
      )}
      {...props}
    />
  );
}

export function CardInner({
  className,
  ...props
}: { className?: string } & VariantProp & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'flex flex-col items-stretch flex-1 w-full items-center justify-center relative rounded-[12px] overflow-hidden',
        className,
      )}
      {...props}
    />
  );
}

export function CardFrame({
  className,
  ...props
}: { className?: string } & VariantProp & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'flex flex-col items-stretch absolute inset-0 border-2 border-[rgba(255,255,255,0.1)] rounded-[14px] pointer-events-none',
        className,
      )}
      {...props}
    />
  );
}

const CARD_CORNER_CLASS = {
  tl: 'top-[4px] left-[4px] border-t-2 border-l-2',
  tr: 'top-[4px] right-[4px] border-t-2 border-r-2',
  bl: 'bottom-[4px] left-[4px] border-b-2 border-l-2',
  br: 'bottom-[4px] right-[4px] border-b-2 border-r-2',
} as const;

export function CardCorner({
  className,
  position,
  ...props
}: {
  className?: string;
  position?: keyof typeof CARD_CORNER_CLASS;
} & VariantProp &
  HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'absolute w-[12px] h-[12px] border-[var(--primary)] pointer-events-none',
        position ? CARD_CORNER_CLASS[position] : undefined,
        className,
      )}
      {...props}
    />
  );
}

import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';

import { cx } from '@arcadeum/ui/utils/cx';

/**
 * Shared card surface styling (no background — derivatives override it).
 * Hover/press scale factors are CSS-variable driven so derived cards
 * (DeckCard, HandCard, SelectableCard, …) can override them inline.
 */
export const CARD_SURFACE_CLASS =
  'flex flex-col items-center justify-center gap-2 p-3 cursor-pointer relative overflow-hidden rounded-[16px] border-2 border-[var(--borderColor)] aspect-[2/3] transition-transform duration-150 ease-out hover:scale-[var(--card-hover-scale,1.05)] hover:border-[var(--primary)] active:scale-[var(--card-press-scale,0.98)]';

const CARD_VARIANT_CLASS = {
  cyberpunk: 'rounded-[4px] border-[#06b6d4]',
  underwater: 'rounded-[24px] border-[#22d3ee]',
} as const;

type CardProps = {
  className?: string;
  style?: CSSProperties;
  variant?: string;
  cardType?: unknown;
  index?: unknown;
  isSticker?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
  'data-testid'?: string;
  children?: ReactNode;
};

/**
 * Base playing-card surface. `cardType` / `index` are no-op props kept for
 * compatibility with call sites that pass them — they don't affect styling.
 */
export function Card({
  className,
  variant,
  cardType: _cardType,
  index: _index,
  isSticker,
  style,
  onClick,
  'data-testid': testId,
  children,
}: CardProps) {
  return (
    <div
      className={cx(
        CARD_SURFACE_CLASS,
        isSticker ? 'border-0 bg-transparent' : 'bg-[var(--background)]',
        variant
          ? CARD_VARIANT_CLASS[variant as keyof typeof CARD_VARIANT_CLASS]
          : undefined,
        className,
      )}
      style={style}
      onClick={onClick}
      data-testid={testId}
    >
      {children}
    </div>
  );
}

export function GradientScrim() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40%',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
}

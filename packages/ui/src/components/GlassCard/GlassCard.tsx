import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';

/** style widened with RN-style shadow keys still used by web consumers. */
export type GlassCardStyle = React.CSSProperties & {
  shadowColor?: string;
  shadowOffset?: { width?: number; height?: number };
  shadowOpacity?: number;
  shadowRadius?: number;
};

export type GlassCardProps = {
  children: ReactNode;
  /** Enable subtle entrance transition. */
  animated?: boolean;
  className?: string;
  style?: GlassCardStyle;
} & React.HTMLAttributes<HTMLDivElement>;

/**
 * Glassmorphic card. Themed tokens resolve to runtime CSS vars minted by the
 * theme providers, so it keeps working across web light/dark/neon/purple.
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  function GlassCard(
    { children, animated = true, className, ...rest },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cx(
          'relative',
          'box-border',
          'overflow-hidden',
          'flex',
          'flex-col',
          'gap-5',
          'rounded-[24px]',
          'border',
          'border-[var(--glassBorder)]',
          'bg-[var(--glassBg)]',
          'p-7',
          animated && 'transition-all duration-500 ease-out',
          className,
        )}
        {...rest}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, var(--glassBorderHover) 50%, transparent 100%)',
          }}
        />
        {children}
      </div>
    );
  },
);

GlassCard.displayName = 'GlassCard';

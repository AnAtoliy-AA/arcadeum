import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'glass' | 'error';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

const variantClasses: Record<CardVariant, string> = {
  default: 'border border-[var(--borderColor)] bg-[var(--background)]',
  elevated:
    'border border-[var(--borderColor)] bg-[var(--background)] shadow-[0_6px_14px_rgba(0,0,0,0.3)]',
  outlined: 'border border-dashed border-[var(--borderColor)] bg-transparent',
  glass: 'border border-[var(--glassBorder)] bg-[var(--glassBg)]',
  error:
    'border border-[rgba(185,28,28,0.4)] bg-[rgba(185,28,28,0.1)] text-[var(--danger)]',
};

const paddingClasses: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
};

export type CardProps = {
  variant?: CardVariant;
  padding?: CardPadding;
  interactive?: boolean;
  children?: ReactNode;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    variant = 'elevated',
    padding = 'md',
    interactive = false,
    children,
    onClick,
    className,
    style,
    'data-testid': dataTestId,
  },
  ref,
) {
  return (
    <div
      ref={ref}
      onClick={onClick}
      style={style}
      data-testid={dataTestId}
      className={cx(
        'relative',
        '',
        'overflow-hidden',
        'rounded-2xl',
        variantClasses[variant],
        paddingClasses[padding],
        interactive &&
          'cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-[var(--primary)] active:scale-[0.98] active:-translate-y-0.5',
        !interactive && 'transition-all duration-300 ease-out',
        className,
      )}
    >
      <span
        aria-hidden
        className={cx(
          'card-top-line',
          'pointer-events-none absolute inset-x-0 top-0 h-0.5 origin-center',
          interactive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-50',
          'transition-all duration-300 ease-out',
        )}
        style={{
          background:
            'linear-gradient(90deg, transparent, var(--primary), transparent)',
        }}
      />
      {children}
    </div>
  );
});

Card.displayName = 'Card';

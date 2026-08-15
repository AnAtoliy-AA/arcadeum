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
  /** @deprecated Use padding instead */
  cardPadding?: CardPadding;
  interactive?: boolean;
  children?: ReactNode;
  group?: string | boolean;
  title?: string;
  /** @deprecated Use onClick instead */
  onPress?: () => void;
  onClick?: (e: unknown) => void;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    variant = 'elevated',
    padding,
    cardPadding,
    interactive = false,
    children,
    onPress,
    onClick,
    className,
    ...rest
  },
  ref,
) {
  const resolvedPadding: CardPadding = padding ?? cardPadding ?? 'md';
  return (
    <div
      ref={ref}
      className={cx(
        'relative',
        'box-border',
        'overflow-hidden',
        'rounded-2xl',
        variantClasses[variant],
        paddingClasses[resolvedPadding],
        interactive &&
          'cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-[var(--primary)] active:scale-[0.98] active:-translate-y-0.5',
        !interactive && 'transition-all duration-300 ease-out',
        className,
      )}
      onClick={onClick ?? onPress}
      {...rest}
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

import { memo } from 'react';
import { cx } from '../../utils/cx';

export type SkeletonProps = {
  width?: string | number;
  height?: string | number;
  variant?: 'rectangular' | 'circular' | 'text';
  animation?: 'shimmer' | 'pulse' | 'none';
  delay?: number | string;
  'data-testid'?: string;
  className?: string;
  style?: React.CSSProperties;
};

const variantClasses: Record<NonNullable<SkeletonProps['variant']>, string> = {
  rectangular: 'rounded-lg',
  circular: 'rounded-full',
  text: 'rounded',
};

const animationClasses: Record<NonNullable<SkeletonProps['animation']>, string> = {
  shimmer:
    'animate-shimmer bg-gradient-to-r from-[var(--borderColor)]/30 via-white/10 to-[var(--borderColor)]/30 bg-[length:200%_100%]',
  pulse: 'animate-pulse bg-[var(--borderColor)]/40',
  none: 'bg-[var(--borderColor)]/30',
};

export const Skeleton = memo(function Skeleton({
  width,
  height,
  variant = 'rectangular',
  animation = 'shimmer',
  'data-testid': dataTestId,
  className,
}: SkeletonProps) {
  const widthClass = typeof width === 'number' ? undefined : width;
  const heightClass = typeof height === 'number' ? undefined : height;

  return (
    <div
      className={cx(
        'shrink-0',
        widthClass ?? (width === undefined && !className ? 'w-full' : ''),
        heightClass ?? (height === undefined && !className ? (variant === 'text' ? 'h-4' : 'h-5') : ''),
        variantClasses[variant],
        animationClasses[animation],
        className,
      )}
      data-testid={dataTestId}
    />
  );
});

type SkeletonVariantProps = Omit<SkeletonProps, 'variant'>;

export const SkeletonText = memo(function SkeletonText({
  width,
  height,
  delay,
  className,
  'data-testid': dataTestId,
}: SkeletonVariantProps) {
  return (
    <Skeleton
      variant="text"
      width={width}
      height={height}
      delay={delay}
      className={className}
      data-testid={dataTestId}
    />
  );
});

export const SkeletonCircle = memo(function SkeletonCircle({
  width,
  height,
  delay,
  className,
  'data-testid': dataTestId,
}: SkeletonVariantProps) {
  return (
    <Skeleton
      variant="circular"
      width={width}
      height={height}
      delay={delay}
      className={className}
      data-testid={dataTestId}
    />
  );
});

export const SkeletonAvatar = memo(function SkeletonAvatar({
  delay,
  className,
  'data-testid': dataTestId,
}: Omit<SkeletonVariantProps, 'width' | 'height'>) {
  return (
    <Skeleton
      variant="circular"
      delay={delay}
      className={cx('h-10 w-10', className)}
      data-testid={dataTestId}
    />
  );
});

export const SkeletonButton = memo(function SkeletonButton({
  delay,
  className,
  'data-testid': dataTestId,
}: Omit<SkeletonVariantProps, 'width' | 'height'>) {
  return (
    <Skeleton
      variant="rectangular"
      delay={delay}
      className={cx('h-10 w-28 rounded-xl', className)}
      data-testid={dataTestId}
    />
  );
});

export type SkeletonTableRowProps = {
  columns: number;
  delay?: number | string;
};

export const SkeletonTableRow = memo(function SkeletonTableRow({ columns, delay }: SkeletonTableRowProps) {
  const columnIndices = Array.from({ length: columns }, (_, i) => i);
  return (
    <div className="flex w-full flex-row items-center gap-3">
      {columnIndices.map((i) => (
        <Skeleton
          key={i}
          variant="text"
          delay={delay}
          className={i === 0 ? 'h-4 w-3/5' : 'h-4 w-12'}
        />
      ))}
    </div>
  );
});

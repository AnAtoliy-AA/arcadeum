'use client';
import { memo, useMemo } from 'react';
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

/**
 * Keyframes for the shimmer effect. Injected via a <style> tag (same pattern
 * as PageLoading) so the component is self-contained and works in any host
 * app without config changes.
 */
const SKIMMER_KEYFRAMES =
  '@keyframes arcadeum-sk-shimmer{0%{background-position:150% 0}100%{background-position:-150% 0}}';

const variantClasses: Record<NonNullable<SkeletonProps['variant']>, string> = {
  rectangular: 'rounded-lg',
  circular: 'rounded-full',
  text: 'rounded',
};

const animationClasses: Record<NonNullable<SkeletonProps['animation']>, string> = {
  shimmer:
    'animate-[arcadeum-sk-shimmer_2s_linear_infinite] [background-image:linear-gradient(90deg,var(--borderColor),rgba(255,255,255,0.18),var(--borderColor))] [background-size:200%_100%]',
  pulse: 'animate-pulse',
  none: '',
};

export const Skeleton = memo(function Skeleton({
  width,
  height,
  variant = 'rectangular',
  animation = 'shimmer',
  delay,
  'data-testid': dataTestId,
  className,
  style: styleProp,
}: SkeletonProps) {
  const style = useMemo(() => {
    const s: React.CSSProperties = { ...styleProp };
    if (width !== undefined) s.width = width;
    if (height !== undefined) s.height = height;
    if (width === undefined && height === undefined && !className) {
      s.width = '100%';
      s.height = variant === 'text' ? 16 : 20;
    }
    if (delay) {
      s.animationDelay = typeof delay === 'number' ? `${delay}s` : delay;
    }
    return s;
  }, [width, height, delay, variant, className, styleProp]);

  return (
    <>
      {animation === 'shimmer' && <style>{SKIMMER_KEYFRAMES}</style>}
      <div
        className={cx(
          'bg-[var(--borderColor)]',
          'opacity-50',
          variantClasses[variant],
          animationClasses[animation],
          className,
        )}
        style={style}
        data-testid={dataTestId}
      />
    </>
  );
});

type SkeletonVariantProps = Omit<SkeletonProps, 'variant'>;

export const SkeletonText = memo(function SkeletonText({
  width,
  height,
  delay,
  className,
  style,
  'data-testid': dataTestId,
}: SkeletonVariantProps) {
  return (
    <Skeleton
      variant="text"
      width={width}
      height={height}
      delay={delay}
      className={className}
      style={style}
      data-testid={dataTestId}
    />
  );
});

export const SkeletonCircle = memo(function SkeletonCircle({
  width,
  height,
  delay,
  className,
  style,
  'data-testid': dataTestId,
}: SkeletonVariantProps) {
  return (
    <Skeleton
      variant="circular"
      width={width}
      height={height}
      delay={delay}
      className={className}
      style={style}
      data-testid={dataTestId}
    />
  );
});

export const SkeletonAvatar = memo(function SkeletonAvatar({
  delay,
  className,
  style,
  'data-testid': dataTestId,
}: Omit<SkeletonVariantProps, 'width' | 'height'>) {
  return (
    <Skeleton
      variant="circular"
      width={40}
      height={40}
      delay={delay}
      className={className}
      style={style}
      data-testid={dataTestId}
    />
  );
});

export const SkeletonButton = memo(function SkeletonButton({
  delay,
  className,
  style,
  'data-testid': dataTestId,
}: Omit<SkeletonVariantProps, 'width' | 'height'>) {
  return (
    <Skeleton
      variant="rectangular"
      width={120}
      height={40}
      delay={delay}
      className={className}
      style={style}
      data-testid={dataTestId}
    />
  );
});

export type SkeletonTableRowProps = {
  columns: number;
  delay?: number | string;
};

export const SkeletonTableRow = memo(function SkeletonTableRow({ columns, delay }: SkeletonTableRowProps) {
  const cells = useMemo(
    () => Array.from({ length: columns }, (_, i) => ({ key: i, width: i === 0 ? '60%' : '40px' })),
    [columns]
  );
  return (
    <div className="flex w-full flex-row gap-2">
      {cells.map(({ key, width }) => (
        <Skeleton key={key} width={width} height={16} variant="text" delay={delay} />
      ))}
    </div>
  );
});

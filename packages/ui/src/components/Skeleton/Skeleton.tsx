'use client';

import { YStack, styled, GetProps } from 'tamagui';
import { memo, useMemo } from 'react';

export type SkeletonProps = {
  width?: string | number;
  height?: string | number;
  variant?: 'rectangular' | 'circular' | 'text';
  animation?: 'shimmer' | 'pulse' | 'none';
  delay?: number | string;
  'data-testid'?: string;
};

const StyledSkeleton = styled(YStack, {
  name: 'Skeleton',
  backgroundColor: '$borderColor',
  opacity: 0.5,

  variants: {
    variant: {
      rectangular: { borderRadius: '$2' },
      circular: { borderRadius: 1000 },
      text: { borderRadius: '$1', height: 16 },
    },
    animation: {
      shimmer: { animation: 'slow' },
      pulse: { animation: 'slow' },
      none: {},
    },
  } as const,

  defaultVariants: {
    variant: 'rectangular',
    animation: 'shimmer',
  },
});

export const Skeleton = memo(function Skeleton({
  width = '100%',
  height = 20,
  variant = 'rectangular',
  animation = 'shimmer',
  delay,
  'data-testid': dataTestId,
}: SkeletonProps) {
  const style = useMemo(
    () => (delay ? { animationDelay: typeof delay === 'number' ? `${delay}s` : delay } : undefined),
    [delay]
  );
  return (
    <StyledSkeleton width={width} height={height} variant={variant} animation={animation} style={style} data-testid={dataTestId} />
  );
});

export const SkeletonText: React.FC<SkeletonProps> = memo((props: SkeletonProps) => (
  <Skeleton variant="text" {...props} />
));
export const SkeletonCircle: React.FC<SkeletonProps> = memo((props: SkeletonProps) => (
  <Skeleton variant="circular" {...props} />
));
export const SkeletonAvatar: React.FC<SkeletonProps> = memo((props: SkeletonProps) => (
  <Skeleton variant="circular" width={40} height={40} {...props} />
));
export const SkeletonButton: React.FC<SkeletonProps> = memo((props: SkeletonProps) => (
  <Skeleton variant="rectangular" width={120} height={40} {...props} />
));

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
    <YStack gap="$2" flexDirection="row" width="100%">
      {cells.map(({ key, width }) => (
        <Skeleton key={key} width={width} height={16} variant="text" delay={delay} />
      ))}
    </YStack>
  );
});

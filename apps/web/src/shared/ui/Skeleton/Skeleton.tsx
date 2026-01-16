import React from 'react';
import styled, { keyframes, css } from 'styled-components';

export interface SkeletonProps {
  /** Width of the skeleton */
  width?: string;
  /** Height of the skeleton */
  height?: string;
  /** Border radius style */
  variant?: 'rectangular' | 'circular' | 'text';
  /** Animation style */
  animation?: 'shimmer' | 'pulse' | 'none';
  /** Animation delay in seconds */
  delay?: number;
  /** Custom className */
  className?: string;
}

const shimmer = keyframes`
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
`;

const StyledSkeleton = styled.div<{
  $width: string;
  $height: string;
  $variant: SkeletonProps['variant'];
  $animation: SkeletonProps['animation'];
  $delay: number;
}>`
  --skeleton-base: ${({ theme }) => theme.surfaces.card.border};
  --skeleton-highlight: ${({ theme }) => theme.surfaces.card.background};

  width: ${({ $width }) => $width};
  height: ${({ $height }) => $height};

  /* Variant styles */
  border-radius: ${({ $variant }) =>
    $variant === 'circular' ? '50%' : $variant === 'text' ? '4px' : '8px'};

  /* Animation styles */
  ${({ $animation, $delay }) => {
    if ($animation === 'shimmer') {
      return css`
        background: linear-gradient(
          90deg,
          var(--skeleton-base) 0%,
          var(--skeleton-highlight) 50%,
          var(--skeleton-base) 100%
        );
        background-size: 200% 100%;
        animation: ${shimmer} 1.5s infinite;
        animation-delay: ${$delay}s;
      `;
    }
    if ($animation === 'pulse') {
      return css`
        background: var(--skeleton-base);
        animation: ${pulse} 1.5s ease-in-out infinite;
        animation-delay: ${$delay}s;
      `;
    }
    return css`
      background: var(--skeleton-base);
    `;
  }}
`;

export function Skeleton({
  width = '100%',
  height = '20px',
  variant = 'rectangular',
  animation = 'shimmer',
  delay = 0,
  className,
}: SkeletonProps) {
  return (
    <StyledSkeleton
      $width={width}
      $height={height}
      $variant={variant}
      $animation={animation}
      $delay={delay}
      className={className}
    />
  );
}

// Convenience components for common use cases
export const SkeletonText = styled(Skeleton).attrs({
  variant: 'text' as const,
  height: '16px',
})``;

export const SkeletonCircle = styled(Skeleton).attrs({
  variant: 'circular' as const,
})``;

export const SkeletonAvatar = styled(Skeleton).attrs({
  variant: 'circular' as const,
  width: '40px',
  height: '40px',
})``;

export const SkeletonButton = styled(Skeleton).attrs({
  variant: 'rectangular' as const,
  height: '40px',
  width: '120px',
})``;

// Table row skeleton for common patterns
export interface SkeletonTableRowProps {
  columns: number;
  delay?: number;
}

export function SkeletonTableRow({
  columns,
  delay = 0,
}: SkeletonTableRowProps) {
  return (
    <>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === 0 ? '60%' : '40px'}
          height="16px"
          variant="text"
          delay={delay + i * 0.05}
        />
      ))}
    </>
  );
}

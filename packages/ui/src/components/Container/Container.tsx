'use client';

import type { ComponentProps } from 'react';
import { cx } from '../../utils/cx';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export type ContainerProps = {
  size?: ContainerSize;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  'data-testid'?: string;
} & React.HTMLAttributes<HTMLDivElement>;

const sizeClasses: Record<ContainerSize, string> = {
  sm: 'max-w-[600px]',
  md: 'max-w-[800px]',
  lg: 'max-w-[1000px]',
  xl: 'max-w-[1400px]',
  full: 'max-w-full',
};

export function Container({
  size = 'lg',
  className,
  style,
  ...rest
}: ContainerProps) {
  return (
    <div
      className={cx('mx-auto w-full gap-4', sizeClasses[size], className)}
      style={style}
      {...rest}
    />
  );
}

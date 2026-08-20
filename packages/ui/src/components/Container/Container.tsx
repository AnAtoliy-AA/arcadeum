'use client';

import { cx } from '../../utils/cx';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export type ContainerProps = {
  size?: ContainerSize;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
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
  children,
  ...rest
}: ContainerProps) {
  return (
    <div
      className={cx(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        sizeClasses[size],
        className,
      )}
      style={style}
      {...rest}
    >
      {children}
    </div>
  );
}


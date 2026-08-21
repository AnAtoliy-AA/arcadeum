'use client';

import { cx } from '../../utils/cx';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export type ContainerProps = {
  size?: ContainerSize;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  'data-testid'?: string;
  'data-current-locale'?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
};

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
  id,
  'data-testid': dataTestId,
  'data-current-locale': dataCurrentLocale,
  onClick,
}: ContainerProps) {
  return (
    <div
      id={id}
      data-testid={dataTestId}
      data-current-locale={dataCurrentLocale}
      onClick={onClick}
      className={cx(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        sizeClasses[size],
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}

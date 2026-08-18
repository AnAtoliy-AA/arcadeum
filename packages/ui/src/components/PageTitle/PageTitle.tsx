import { memo } from 'react';
import type { ReactNode, ReactElement } from 'react';
import { cx } from '../../utils/cx';
import './PageTitle.css';

export type PageTitleSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeClasses: Record<PageTitleSize, string> = {
  sm: 'text-[18px]',
  md: 'text-[24px]',
  lg: 'text-[32px]',
  xl: 'text-[40px]',
};

export type PageTitleProps = {
  size?: PageTitleSize;
  gradient?: boolean;
  children: ReactNode;
  className?: string;
};

export const PageTitle = memo(function PageTitle({
  size = 'lg',
  gradient = false,
  children,
  className,
}: PageTitleProps): ReactElement {
  return (
    <h1
      className={cx(
        'm-0 overflow-visible font-extrabold leading-[1.2] tracking-[-0.5px]',
        sizeClasses[size],
        gradient
          ? 'page-title-gradient bg-clip-text text-transparent'
          : 'page-title-base text-[var(--color)]',
        gradient &&
          'bg-[linear-gradient(135deg,var(--color,#ecefee)_0%,var(--primary,#0369a1)_100%)] bg-[length:200%_200%]',
        className,
      )}
    >
      {children}
    </h1>
  );
});

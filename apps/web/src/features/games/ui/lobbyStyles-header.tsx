import type { ReactNode } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';

export const GameHeader = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cx(
      'flex flex-row items-center justify-between flex-wrap gap-3 min-w-0 px-5 py-4 border-b border-[rgba(255,255,255,0.1)] max-[1023px]:p-3 max-[800px]:px-3 max-[800px]:py-2',
      className,
    )}
  >
    {children}
  </div>
);

export const GameInfo = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cx(
      'flex flex-row items-center gap-4 flex-wrap min-w-0 flex-1 max-[800px]:gap-2',
      className,
    )}
  >
    {children}
  </div>
);

export const GameTitleText = ({
  className,
  gradient,
  children,
}: {
  className?: string;
  gradient?: string;
  children?: ReactNode;
}) => (
  <h2
    className={cx(
      'text-[24px] font-bold',
      gradient ? 'text-gradient shimmer-animated' : undefined,
      className,
    )}
    style={
      gradient
        ? {
            backgroundImage: gradient,
            backgroundSize: '200% auto',
          }
        : undefined
    }
  >
    {children}
  </h2>
);

export const VariantText = ({
  className,
  gradient,
  children,
}: {
  className?: string;
  gradient?: string;
  children?: ReactNode;
}) => (
  <span
    className={cx(
      'text-[18px] font-semibold',
      gradient ? 'text-gradient shimmer-animated' : undefined,
      className,
    )}
    style={
      gradient
        ? {
            backgroundImage: gradient,
            backgroundSize: '200% auto',
          }
        : undefined
    }
  >
    {children}
  </span>
);

export const HeaderActions = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div className={cx('flex flex-row items-center gap-3', className)}>
    {children}
  </div>
);

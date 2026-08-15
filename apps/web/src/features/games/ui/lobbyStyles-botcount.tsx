import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';

export const BotCountLabel = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cx(
      'text-[14px] font-medium text-[var(--textSecondary)] uppercase tracking-[0.5px]',
      className,
    )}
    {...props}
  >
    {children}
  </span>
);

export const BotCountButtons = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx('flex flex-row items-stretch gap-2', className)}
    {...props}
  >
    {children}
  </div>
);

import type { ReactNode } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';

export const BotCountLabel = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <span
    className={cx(
      'text-[14px] font-medium text-[var(--textSecondary)] uppercase tracking-[0.5px]',
      className,
    )}
  >
    {children}
  </span>
);

export const BotCountButtons = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div className={cx('flex flex-row items-stretch gap-2', className)}>
    {children}
  </div>
);

import { memo } from 'react';
import type { ReactNode, ReactElement } from 'react';
import { cx } from '../../utils/cx';

export type EmptyStateProps = {
  message: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export const EmptyState = memo(function EmptyState({
  message,
  icon,
  action,
  className,
}: EmptyStateProps): ReactElement {
  return (
    <div
      className={cx(
        'box-border',
        'flex',
        'flex-col',
        'items-center',
        'justify-center',
        'gap-4',
        'rounded-2xl',
        'border',
        'border-dashed',
        'border-[var(--borderColor)]',
        'bg-[var(--background)]',
        'p-8',
        className,
      )}
    >
      {icon && (
        <div className="mb-2 scale-[2] opacity-50">
          {typeof icon === 'string' ? <span>{icon}</span> : icon}
        </div>
      )}
      <p className="m-0 text-center text-[18px] leading-[24px] text-[var(--color)] opacity-70">
        {message}
      </p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
});

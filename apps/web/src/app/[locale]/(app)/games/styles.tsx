import type { ReactNode } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import {
  Spinner as SharedSpinner,
  PageTitle as SharedPageTitle,
} from '@arcadeum/ui';

export const Header = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cx(
      'flex flex-wrap items-center justify-between gap-4',
      className,
    )}
  >
    {children}
  </div>
);

export const HeaderControls = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div className={cx('flex flex-wrap items-center gap-4', className)}>
    {children}
  </div>
);

export const ViewToggle = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cx(
      'overflow-hidden rounded-[10px] border border-[var(--borderColor)] max-[768px]:hidden',
      className,
    )}
  >
    {children}
  </div>
);

export const Title = SharedPageTitle;

export const Filters = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cx(
      'flex w-full max-w-full flex-col gap-4',
      'rounded-2xl border border-[var(--borderColor)] bg-[var(--background)] p-4 sm:p-5',
      'shadow-sm backdrop-blur-md',
      className,
    )}
  >
    {children}
  </div>
);

export const FilterGroup = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cx(
      'flex w-full max-w-full flex-col items-start gap-1.5',
      className,
    )}
  >
    {children}
  </div>
);

export const FilterLabel = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <span
    className={cx(
      'select-none text-[12px] font-bold uppercase tracking-[1.2px] text-[var(--color)] opacity-75',
      className,
    )}
  >
    {children}
  </span>
);

export const FilterChips = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cx(
      'flex w-full max-w-full items-center gap-2 overflow-x-auto py-1 scrollbar-none',
      'flex-nowrap md:flex-wrap',
      className,
    )}
  >
    {children}
  </div>
);

export const Loading = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cx(
      'flex flex-col items-center justify-center gap-6 p-16',
      className,
    )}
  >
    {children}
  </div>
);

export { SharedSpinner as Spinner };

export const Error = ({
  className,
  children,
  'data-testid': dataTestId,
}: {
  className?: string;
  children?: ReactNode;
  'data-testid'?: string;
}) => (
  <div
    data-testid={dataTestId}
    className={cx(
      'col-span-full block rounded-[12px] border border-[#dc2626] p-4 font-medium text-[#ef4444]',
      className,
    )}
    style={{ background: 'linear-gradient(135deg, #7f1d1d20, transparent)' }}
  >
    {children}
  </div>
);

export const Empty = ({
  className,
  children,
  'data-testid': dataTestId,
}: {
  className?: string;
  children?: ReactNode;
  'data-testid'?: string;
}) => (
  <div
    data-testid={dataTestId}
    className={cx(
      'col-span-full block rounded-[20px] border border-dashed border-[var(--borderColor)] bg-[var(--background)] px-8 py-16 text-center text-[1.1rem] text-[var(--textSecondary)]',
      className,
    )}
  >
    {children}
  </div>
);

export const ServerWakeUpContainer = ({
  className,
  children,
  'data-testid': dataTestId,
}: {
  className?: string;
  children?: ReactNode;
  'data-testid'?: string;
}) => (
  <div
    data-testid={dataTestId}
    className={cx(
      'col-span-full flex min-h-[50vh] w-full flex-1 items-center justify-center',
      className,
    )}
  >
    {children}
  </div>
);

export const EndOfListText = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cx(
      'col-span-full block p-8 text-center text-[0.95rem] text-[var(--textSecondary)]',
      className,
    )}
  >
    {children}
  </div>
);

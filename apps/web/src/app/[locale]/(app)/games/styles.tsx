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
      'flex w-full max-w-full flex-wrap items-center gap-x-6 gap-y-5',
      'rounded-[16px] border border-[var(--borderColor)] bg-[var(--background)] px-9 py-5',
      'max-[768px]:px-3',
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
      'flex max-w-full min-w-[150px] flex-col items-start gap-1 p-1',
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
      'mb-1 select-none text-[14px] font-bold uppercase tracking-[1.5px] text-[var(--color)] opacity-80',
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
  <div className={cx('flex flex-wrap gap-[0.6rem] px-1 py-2', className)}>
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

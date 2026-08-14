import { cx } from '@arcadeum/ui/utils/cx';
import {
  Spinner as SharedSpinner,
  PageTitle as SharedPageTitle,
} from '@arcadeum/ui';

export const Header = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'flex flex-wrap items-center justify-between gap-4',
      className,
    )}
    {...rest}
  />
);

export const HeaderControls = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx('flex flex-wrap items-center gap-4', className)}
    {...rest}
  />
);

export const ViewToggle = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'overflow-hidden rounded-[10px] border border-[var(--borderColor)] max-[768px]:hidden',
      className,
    )}
    {...rest}
  />
);

export const Title = SharedPageTitle;

export const Filters = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'flex w-full max-w-full flex-wrap items-center gap-x-6 gap-y-5',
      'rounded-[16px] border border-[var(--borderColor)] bg-[var(--background)] px-9 py-5',
      'max-[768px]:px-3',
      className,
    )}
    {...rest}
  />
);

export const SearchContainer = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx('flex min-w-[280px] max-w-[450px] flex-1 gap-2', className)}
    {...rest}
  />
);

export const FilterGroup = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'flex max-w-full min-w-[150px] flex-col items-start gap-1 p-1',
      className,
    )}
    {...rest}
  />
);

export const FilterLabel = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cx(
      'mb-1 select-none text-[14px] font-bold uppercase tracking-[1.5px] text-[var(--color)] opacity-80',
      className,
    )}
    {...rest}
  />
);

export const FilterChips = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx('flex flex-wrap gap-[0.6rem] px-1 py-2', className)}
    {...rest}
  />
);

export const Loading = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'flex flex-col items-center justify-center gap-6 p-16',
      className,
    )}
    {...rest}
  />
);

export { SharedSpinner as Spinner };

export const Error = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'col-span-full block rounded-[12px] border border-[#dc2626] p-4 font-medium text-[#ef4444]',
      className,
    )}
    style={{ background: 'linear-gradient(135deg, #7f1d1d20, transparent)' }}
    {...rest}
  />
);

export const Empty = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'col-span-full block rounded-[20px] border border-dashed border-[var(--borderColor)] bg-[var(--background)] px-8 py-16 text-center text-[1.1rem] text-[rgba(236,239,238,0.45)]',
      className,
    )}
    {...rest}
  />
);

export const ServerWakeUpContainer = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'col-span-full flex min-h-[50vh] w-full flex-1 items-center justify-center',
      className,
    )}
    {...rest}
  />
);

export const EndOfListText = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'col-span-full block p-8 text-center text-[0.95rem] text-[rgba(236,239,238,0.45)]',
      className,
    )}
    {...rest}
  />
);

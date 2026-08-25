import type { ReactNode } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { Typography } from '@arcadeum/ui';

export function LogItem({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cx(
        'flex flex-col items-stretch gap-3 rounded-2xl border border-[var(--borderColor)] bg-[var(--background)] p-5 hover:border-[var(--borderColorHover)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function LogHeader({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cx(
        'flex flex-row items-center gap-4 justify-between',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function LogTimestamp({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Typography
      className={cx('font-mono', className)}
      uiSize="xs"
      alpha="medium"
    >
      {children}
    </Typography>
  );
}

export function LogScope({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Typography
      className={cx(
        'rounded-full bg-[var(--backgroundHover)] px-3 py-1 uppercase tracking-[0.25em]',
        className,
      )}
      uiSize="xs"
      weight="600"
      alpha="medium"
    >
      {children}
    </Typography>
  );
}

export function LogSender({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Typography className={className} uiSize="sm" weight="500" alpha="high">
      {children}
    </Typography>
  );
}

export function LogMessage({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Typography className={cx('leading-[28px]', className)}>
      {children}
    </Typography>
  );
}

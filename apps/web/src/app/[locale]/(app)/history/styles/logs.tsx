import type { ComponentProps, ReactNode } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { Typography } from '@arcadeum/ui';

export function LogItem({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-col items-stretch gap-3 rounded-2xl border border-[var(--borderColor)] bg-[var(--background)] p-5 hover:border-[var(--borderColorHover)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function LogHeader({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-center gap-4 justify-between',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function LogTimestamp({
  className,
  children,
  ...props
}: { className?: string; children?: ReactNode } & ComponentProps<
  typeof Typography
>) {
  return (
    <Typography
      className={cx('font-mono', className)}
      uiSize="xs"
      alpha="medium"
      {...props}
    >
      {children}
    </Typography>
  );
}

export function LogScope({
  className,
  children,
  ...props
}: { className?: string; children?: ReactNode } & ComponentProps<
  typeof Typography
>) {
  return (
    <Typography
      className={cx(
        'box-border rounded-full bg-[var(--backgroundStrong, rgba(255,255,255,0.03))] px-3 py-1 uppercase tracking-[0.25em]',
        className,
      )}
      uiSize="xs"
      weight="600"
      alpha="medium"
      {...props}
    >
      {children}
    </Typography>
  );
}

export function LogSender({
  className,
  children,
  ...props
}: { className?: string; children?: ReactNode } & ComponentProps<
  typeof Typography
>) {
  return (
    <Typography
      className={cx(className)}
      uiSize="sm"
      weight="500"
      alpha="high"
      {...props}
    >
      {children}
    </Typography>
  );
}

export function LogMessage({
  className,
  children,
  ...props
}: { className?: string; children?: ReactNode } & ComponentProps<
  typeof Typography
>) {
  return (
    <Typography className={cx('leading-[28px]', className)} {...props}>
      {children}
    </Typography>
  );
}

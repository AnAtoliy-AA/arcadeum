import { forwardRef, type ReactNode } from 'react';
import type * as React from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { Card, Badge, Typography } from '@arcadeum/ui';

type WithGetProps<T> =
  T extends React.ComponentType<infer P>
    ? P & React.HTMLAttributes<HTMLElement> & { children?: ReactNode }
    : never;

export function EntriesGrid({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx('grid gap-4 w-full', className)}
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}
      {...props}
    />
  );
}

export function EntryCard({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Card>) {
  return (
    <Card
      className={cx(
        'flex flex-col items-stretch gap-3 cursor-pointer',
        className,
      )}
      variant="elevated"
      padding="md"
      interactive
      {...props}
    >
      {children}
    </Card>
  );
}

export function EntryHeader({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'flex flex-row items-start justify-between gap-4',
        className,
      )}
      {...props}
    />
  );
}

export function EntryTitleGroup({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx('flex flex-col items-stretch flex-1 min-w-0', className)}
      {...props}
    />
  );
}

const entryTextClasses =
  'w-full overflow-hidden whitespace-nowrap [text-overflow:ellipsis]';

export const EntryGameName = ({
  children,
  title,
  ...props
}: { title?: string } & React.ComponentProps<typeof Typography>) => (
  <Typography
    className={entryTextClasses}
    uiSize="lg"
    weight="600"
    title={title}
    {...props}
  >
    {children}
  </Typography>
);

export const EntryRoomName = ({
  children,
  title,
  ...props
}: { title?: string } & React.ComponentProps<typeof Typography>) => (
  <Typography
    className={entryTextClasses}
    uiSize="sm"
    alpha="medium"
    title={title}
    {...props}
  >
    {children}
  </Typography>
);

export const EntryStatus = ({
  children,
  ...props
}: WithGetProps<typeof Badge>) => (
  <Badge
    className={'rounded-[999px] shrink-0'}
    variant="info"
    size="sm"
    {...props}
  >
    {children}
  </Badge>
);

export function EntryMeta({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx('flex flex-row items-stretch flex-wrap gap-2', className)}
      {...props}
    />
  );
}

export function EntryFooter({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'flex flex-row items-center justify-between gap-4 mt-auto pt-3 border-t border-[var(--borderColor)]',
        className,
      )}
      {...props}
    />
  );
}

export function EntryTimestamp({
  children,
  ...props
}: { children?: ReactNode } & React.ComponentProps<typeof Typography>) {
  return (
    <Typography uiSize="xs" alpha="medium" {...props}>
      {children}
    </Typography>
  );
}

export function EntryViewDetails({
  children,
  ...props
}: { children?: ReactNode } & React.ComponentProps<typeof Typography>) {
  return (
    <Typography uiSize="sm" weight="600" color="var(--primary)" {...props}>
      {children}
    </Typography>
  );
}

export const PaginationSpinner = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function PaginationSpinner({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cx(
        'flex flex-col items-center justify-center p-8 w-full [grid-column:1/-1]',
        className,
      )}
      {...props}
    />
  );
});

export function EndOfListText({
  children,
  ...props
}: { children?: ReactNode } & React.ComponentProps<typeof Typography>) {
  return (
    <Typography
      className={'p-8 w-full [grid-column:1/-1]'}
      uiSize="sm"
      alpha="medium"
      textCenter
      {...props}
    >
      {children}
    </Typography>
  );
}

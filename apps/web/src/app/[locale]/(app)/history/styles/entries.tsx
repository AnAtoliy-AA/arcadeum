import { forwardRef, type MouseEventHandler, type ReactNode } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { Card, Badge, Typography } from '@arcadeum/ui';

export function EntriesGrid({ children }: { children?: ReactNode }) {
  return (
    <div
      className="grid gap-4 w-full"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}
    >
      {children}
    </div>
  );
}

export function EntryCard({
  onClick,
  'data-testid': dataTestId,
  children,
}: {
  onClick?: MouseEventHandler<HTMLDivElement>;
  'data-testid'?: string;
  children?: ReactNode;
}) {
  return (
    <Card
      className="flex flex-col items-stretch gap-3 cursor-pointer"
      variant="elevated"
      padding="md"
      interactive
      onClick={onClick}
      data-testid={dataTestId}
    >
      {children}
    </Card>
  );
}

export function EntryHeader({ children }: { children?: ReactNode }) {
  return (
    <div className="flex flex-row items-start justify-between gap-4">
      {children}
    </div>
  );
}

export function EntryTitleGroup({ children }: { children?: ReactNode }) {
  return (
    <div className="flex flex-col items-stretch flex-1 min-w-0">{children}</div>
  );
}

const entryTextClasses =
  'w-full overflow-hidden whitespace-nowrap [text-overflow:ellipsis]';

export const EntryGameName = ({
  title,
  children,
}: {
  title?: string;
  children?: ReactNode;
}) => (
  <Typography
    className={entryTextClasses}
    uiSize="lg"
    weight="600"
    title={title}
  >
    {children}
  </Typography>
);

export const EntryRoomName = ({
  title,
  children,
}: {
  title?: string;
  children?: ReactNode;
}) => (
  <Typography
    className={entryTextClasses}
    uiSize="sm"
    alpha="medium"
    title={title}
  >
    {children}
  </Typography>
);

export const EntryStatus = ({
  'data-testid': dataTestId,
  children,
}: {
  'data-testid'?: string;
  children?: ReactNode;
}) => (
  <span data-testid={dataTestId} className="shrink-0">
    <Badge className={'rounded-[999px]'} variant="info" size="sm">
      {children}
    </Badge>
  </span>
);

export function EntryMeta({ children }: { children?: ReactNode }) {
  return (
    <div className="flex flex-row items-stretch flex-wrap gap-2">
      {children}
    </div>
  );
}

export function EntryFooter({ children }: { children?: ReactNode }) {
  return (
    <div className="flex flex-row items-center justify-between gap-4 mt-auto pt-3 border-t border-[var(--borderColor)]">
      {children}
    </div>
  );
}

export function EntryTimestamp({ children }: { children?: ReactNode }) {
  return (
    <Typography uiSize="xs" alpha="medium">
      {children}
    </Typography>
  );
}

export function EntryViewDetails({ children }: { children?: ReactNode }) {
  return (
    <Typography uiSize="sm" weight="600" color="var(--primary)">
      {children}
    </Typography>
  );
}

export const PaginationSpinner = forwardRef<
  HTMLDivElement,
  { className?: string; children?: ReactNode }
>(function PaginationSpinner({ className, children }, ref) {
  return (
    <div
      ref={ref}
      className={cx(
        'flex flex-col items-center justify-center p-8 w-full [grid-column:1/-1]',
        className,
      )}
    >
      {children}
    </div>
  );
});

export function EndOfListText({ children }: { children?: ReactNode }) {
  return (
    <Typography
      className={'p-8 w-full [grid-column:1/-1]'}
      uiSize="sm"
      alpha="medium"
      textCenter
    >
      {children}
    </Typography>
  );
}

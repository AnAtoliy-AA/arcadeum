import { cx } from '@arcadeum/ui/utils/cx';
import { Typography } from '@arcadeum/ui';
import type { ReactNode } from 'react';

export function DetailTimestamp({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Typography
      className={cx(
        'border rounded-2xl px-4 py-3 border-[var(--borderColor)] bg-[var(--backgroundStrong, rgba(255,255,255,0.03))]',
        className,
      )}
      uiSize="sm"
      alpha="medium"
    >
      {children}
    </Typography>
  );
}

export function Section({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        'flex flex-col items-stretch gap-4 p-6 rounded-3xl border border-[var(--borderColor)] bg-[var(--backgroundStrong, rgba(255,255,255,0.03))]',
        className,
      )}
    >
      {children}
    </div>
  );
}

// SectionTitle replaces ::before pseudo-element with a real accent bar element.
// Used 4 times in HistoryDetailModal — must stay as a named export.
export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-row items-center gap-2">
      <div
        className="flex flex-col items-stretch w-[4px] h-[18px] rounded-lg"
        style={{
          background:
            'linear-gradient(180deg, var(--color-primary, #6366f1) 0%, var(--color-primary-dark, #4f46e5) 100%)',
        }}
      />
      <Typography className={'-m-0'} uiSize="lg" weight="600">
        {children}
      </Typography>
    </div>
  );
}

export function SectionDescription({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Typography
      className={cx('leading-[28px]', className)}
      uiSize="sm"
      alpha="medium"
    >
      {children}
    </Typography>
  );
}

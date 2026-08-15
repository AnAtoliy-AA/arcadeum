import type { HTMLAttributes } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';

type DivProps = HTMLAttributes<HTMLDivElement> & { className?: string };
type SpanProps = HTMLAttributes<HTMLSpanElement> & { className?: string };

export function Page({
  className,
  ...props
}: HTMLAttributes<HTMLElement> & { className?: string }) {
  return (
    <main
      className={cx(
        'box-border min-h-screen bg-[var(--background)] pt-20',
        className,
      )}
      {...props}
    />
  );
}

export function Container({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        'box-border w-full max-w-[1200px] self-center p-6 px-4',
        className,
      )}
      {...props}
    />
  );
}

// Card is provided by @arcadeum/ui — use <Card variant="default" padding="md"> in JSX

export function CardTitle({ className, ...props }: SpanProps) {
  return (
    <h3
      className={cx(
        'box-border m-0 text-[18px] font-semibold text-[var(--color)]',
        className,
      )}
      {...props}
    />
  );
}

export function StatValue({ className, ...props }: SpanProps) {
  return (
    <span
      className={cx(
        'box-border text-[40px] font-bold text-[var(--primaryGradientStart)]',
        className,
      )}
      {...props}
    />
  );
}

export function StatLabel({ className, ...props }: SpanProps) {
  return (
    <span
      className={cx(
        'box-border text-[14px] uppercase tracking-[1px] text-[rgba(236,239,238,0.7)]',
        className,
      )}
      {...props}
    />
  );
}

export function BreakdownTable({ className, ...props }: DivProps) {
  return (
    <div
      className={cx(
        'box-border mt-6 w-full overflow-hidden rounded-xl border border-[var(--borderColor)] bg-[var(--background)]',
        className,
      )}
      {...props}
    />
  );
}

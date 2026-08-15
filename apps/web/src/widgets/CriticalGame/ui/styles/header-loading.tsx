import type { CSSProperties, HTMLAttributes } from 'react';

import { cx } from '@arcadeum/ui/utils/cx';

export function ServerLoadingMessage({
  className,
  style,
  ...props
}: {
  className?: string;
  style?: CSSProperties;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-col items-stretch gap-3 p-4 mt-3 rounded-[14px] border border-[rgba(99,102,241,0.2)] max-w-[420px] relative overflow-hidden',
        className,
      )}
      style={{
        background:
          'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.06) 50%, rgba(236, 72, 153, 0.05) 100%)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 2.5px 5px rgba(0, 0, 0, 0.3)',
        ...style,
      }}
      {...props}
    />
  );
}

export function ServerLoadingHeader({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-stretch items-center gap-3',
        className,
      )}
      {...props}
    />
  );
}

export function ServerLoadingSpinner({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-col items-stretch w-6 h-6 shrink-0 rounded-full border-[2.5px] border-[rgba(99,102,241,0.15)] border-t-[#6366f1] border-r-[#8b5cf6]',
        className,
      )}
      {...props}
    />
  );
}

export function ServerLoadingTitle({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx(
        'box-border text-[14px] font-semibold text-[var(--color)]',
        className,
      )}
      {...props}
    />
  );
}

export function ServerLoadingText({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx(
        'box-border text-[12px] text-[var(--color)] opacity-[0.8] leading-[18px] pl-[36px] relative',
        className,
      )}
      {...props}
    />
  );
}

export function ServerLoadingProgressBar({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-col items-stretch h-[6px] bg-[rgba(99,102,241,0.1)] rounded-[3px] overflow-hidden mt-2 relative',
        className,
      )}
      {...props}
    />
  );
}

export function ServerLoadingFooter({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-stretch justify-between items-center mt-1 pl-[36px]',
        className,
      )}
      {...props}
    />
  );
}

export function ServerLoadingPercentage({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx(
        'box-border text-[12px] font-semibold text-[#6366f1]',
        className,
      )}
      {...props}
    />
  );
}

export function ServerLoadingTimer({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx(
        'box-border text-[11px] text-[var(--color)] opacity-[0.7]',
        className,
      )}
      {...props}
    />
  );
}

export function HeaderProgressLabel({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx(
        'box-border text-[12px] font-bold leading-[18px] text-[var(--color)] opacity-[0.9]',
        className,
      )}
      {...props}
    />
  );
}

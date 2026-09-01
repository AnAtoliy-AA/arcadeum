import type { ReactNode } from 'react';
import { cx } from '../../../utils/cx';

export function ShimmerBox({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cx(
        'animate-shimmer rounded-lg bg-gradient-to-r from-[var(--borderColor)]/30 via-white/10 to-[var(--borderColor)]/30 bg-[length:200%_100%]',
        className,
      )}
    />
  );
}

export function GlassPanel({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        'relative flex flex-col overflow-hidden rounded-3xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-6 backdrop-blur-md',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--glassBorderHover)] to-transparent" />
      {children}
    </div>
  );
}

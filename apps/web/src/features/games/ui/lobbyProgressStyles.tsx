import type { ReactNode } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';

export const ProgressWrapper = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cx(
      'flex flex-col items-stretch w-full max-w-[300px]',
      className,
    )}
  >
    {children}
  </div>
);

export const ProgressLabel = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cx(
      'flex flex-row items-stretch justify-between mb-2',
      className,
    )}
  >
    {children}
  </div>
);

export const ProgressBar = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cx(
      'flex flex-col items-stretch h-2 bg-[rgba(99,102,241,0.15)] rounded-[4px] overflow-hidden',
      className,
    )}
  >
    {children}
  </div>
);

export const ProgressFill = ({
  width,
  className,
}: {
  width?: string | number;
  className?: string;
}) => (
  <div
    className={cx('h-full rounded-[4px] bg-[#6366f1]', className)}
    style={width !== undefined ? { width } : undefined}
  />
);

export const HostControls = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cx(
      'flex flex-col items-center gap-3 p-4 max-[800px]:p-3 max-[800px]:gap-2.5 bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.2)] rounded-[16px]',
      className,
    )}
  >
    {children}
  </div>
);

export const HostLabel = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <span
    className={cx(
      'text-[11px] font-semibold uppercase tracking-[1px] text-[#6366f1]',
      className,
    )}
  >
    {children}
  </span>
);

export const LobbyStickyStart = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cx(
      'flex flex-col items-center py-3 px-5 overflow-hidden max-[800px]:fixed max-[800px]:left-0 max-[800px]:right-0 max-[800px]:bottom-0 max-[800px]:py-2.5 max-[800px]:px-4 max-[800px]:pb-[calc(env(safe-area-inset-bottom,0px)+10px)] max-[800px]:bg-[rgba(15,23,42,0.95)] max-[800px]:backdrop-blur-[16px] max-[800px]:border-t max-[800px]:border-[rgba(255,255,255,0.1)] max-[800px]:z-[150] max-[800px]:items-center max-[800px]:overflow-hidden',
      className,
    )}
  >
    {children}
  </div>
);

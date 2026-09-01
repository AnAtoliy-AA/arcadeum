import type { ReactElement } from 'react';
import { cx } from '../../../utils/cx';

export interface SplashLoadingProps {
  message?: string;
  className?: string;
  'data-testid'?: string;
}

export function SplashLoading({
  message = 'Loading Arcadeum...',
  className,
  'data-testid': dataTestId = 'splash-loading',
}: SplashLoadingProps): ReactElement {
  return (
    <div
      data-testid={dataTestId}
      className={cx(
        'relative flex min-h-[60vh] w-full flex-col items-center justify-center px-4 py-12',
        className,
      )}
    >
      <div className="relative z-10 flex flex-col items-center gap-8 text-center">
        {/* Clean Branded Emblem Card with subtle border and padding */}
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-3 shadow-lg backdrop-blur-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Arcadeum"
            width={64}
            height={64}
            className="h-16 w-16 object-contain"
          />
        </div>

        {/* Brand Title & Subtitle */}
        <div className="flex flex-col items-center gap-1.5">
          <h2 className="text-2xl font-black tracking-wider text-[var(--color)] uppercase sm:text-3xl">
            Arcadeum
          </h2>
          <p className="text-xs font-semibold tracking-widest text-[var(--muted-foreground)] uppercase">
            Online Gaming Arena
          </p>
        </div>

        {/* Clean Progress / Shimmer Bar */}
        <div className="flex w-64 flex-col items-center gap-3 sm:w-72">
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[var(--borderColor)]/30">
            <div className="animate-shimmer absolute inset-0 h-full w-full bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--primary)] bg-[length:200%_100%]" />
          </div>

          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--primary)]"
            />
            <span className="text-xs font-medium text-[var(--color)] opacity-75">
              {message}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

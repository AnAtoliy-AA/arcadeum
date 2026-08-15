import type { HTMLAttributes } from 'react';

import { cx } from '@arcadeum/ui/utils/cx';

const BASE = 'flex flex-col items-stretch';

export function SonarRadar({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        BASE,
        'absolute top-1/2 left-1/2 w-[150%] h-[150%] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-[1]',
        className,
      )}
      {...props}
    />
  );
}

export function Bubble({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        BASE,
        'absolute bottom-0 w-1.5 h-1.5 bg-[rgba(165,243,252,0.4)] rounded-full pointer-events-none z-[0]',
        className,
      )}
      {...props}
    />
  );
}

export function FishSilhouette({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        BASE,
        'absolute w-[12px] h-[6px] bg-[rgba(34,211,238,0.3)] pointer-events-none z-[0]',
        className,
      )}
      {...props}
    />
  );
}

export function SonarSweep({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        BASE,
        'absolute top-1/2 left-1/2 w-[150vmax] h-[150vmax] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[0] rounded-full overflow-hidden',
        className,
      )}
      {...props}
    />
  );
}

export function FloatingDots({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        BASE,
        'absolute inset-0 pointer-events-none z-[1]',
        className,
      )}
      {...props}
    />
  );
}

export function CircuitLines({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        BASE,
        'absolute inset-0 pointer-events-none z-[0] opacity-[0.3]',
        className,
      )}
      {...props}
    />
  );
}

export function Snowflake({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        BASE,
        'absolute top-[-10vh] bg-white rounded-full opacity-[0.6] pointer-events-none z-[1]',
        className,
      )}
      {...props}
    />
  );
}

const ICE_CRYSTAL_CORNER_CLASS = {
  tl: 'top-[10px] left-[10px] rotate-0',
  tr: 'top-[10px] right-[10px] rotate-[90deg]',
  bl: 'bottom-[10px] left-[10px] -rotate-[90deg]',
  br: 'bottom-[10px] right-[10px] rotate-[180deg]',
} as const;

export function IceCrystal({
  className,
  corner,
  ...props
}: {
  className?: string;
  corner?: 'tl' | 'tr' | 'bl' | 'br';
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        BASE,
        'absolute w-10 h-10 pointer-events-none z-[5] opacity-[0.5]',
        corner ? ICE_CRYSTAL_CORNER_CLASS[corner] : undefined,
        className,
      )}
      {...props}
    />
  );
}

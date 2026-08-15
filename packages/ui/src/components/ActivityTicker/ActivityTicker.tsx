'use client';

import { useEffect, useRef, useState } from 'react';
import { cx } from '../../utils/cx';

export type ActivityTickerItem = {
  tag: string;
  who: string;
  what: string;
  when?: string;
  color?: string;
};

export type ActivityTickerProps = {
  items: ActivityTickerItem[];
  interval?: number;
  label?: string;
  pauseOnHover?: boolean;
  'data-testid'?: string;
  className?: string;
};

const TickerShellClasses = [
  'box-border',
  'flex',
  'flex-row',
  'items-center',
  'gap-3',
  'py-3',
  'px-4',
  'rounded-2xl',
  'border',
  'border-[var(--glassBorder)]',
  'bg-[var(--glassBg)]',
  'overflow-hidden',
].join(' ');

const TickerLabelClasses = [
  'box-border',
  'shrink-0',
  'text-[11px]',
  'uppercase',
  'tracking-[1.4px]',
  'text-[var(--textSecondary)]',
  'max-[800px]:hidden',
].join(' ');

const TickerTrackClasses = 'box-border relative h-[22px] flex-1';

function tickerRowClasses(active: boolean): string {
  return cx(
    'box-border absolute left-0 right-0 top-0 flex flex-row items-center gap-3 transition-all duration-300 ease-out',
    active
      ? 'pointer-events-auto translate-y-0 opacity-100'
      : 'pointer-events-none translate-y-[8px] opacity-0',
  );
}

const TagBaseClasses = [
  'inline-block',
  'shrink-0',
  'rounded-full',
  'border',
  'px-2',
  'py-[3px]',
  'text-[10px]',
  'font-bold',
  'uppercase',
  'tracking-[0.1em]',
  'leading-[1.2]',
].join(' ');

export function ActivityTicker({
  items,
  interval = 3200,
  label,
  pauseOnHover = true,
  'data-testid': testId,
  className,
}: ActivityTickerProps) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (items.length <= 1 || paused) return;
    if (typeof window !== 'undefined') {
      const reduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      if (reduced) return;
    }
    timerRef.current = setInterval(() => {
      setIdx((i) => (i + 1) % items.length);
    }, interval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [items.length, interval, paused]);

  if (items.length === 0) return null;

  const handleMouseEnter = () => {
    if (pauseOnHover) setPaused(true);
  };
  const handleMouseLeave = () => {
    if (pauseOnHover) setPaused(false);
  };

  return (
    <div
      aria-live="polite"
      data-testid={testId}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cx(TickerShellClasses, className)}
    >
      {label ? <span className={TickerLabelClasses}>{label}</span> : null}
      <div className={TickerTrackClasses}>
        {items.map((it, i) => {
          const active = i === idx;
          const accent = it.color ?? '#38bdf8';
          return (
            <div key={`${it.tag}-${i}`} className={tickerRowClasses(active)}>
              <span
                className={TagBaseClasses}
                style={{ color: accent, borderColor: accent }}
              >
                {it.tag}
              </span>
              <span
                className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[13px]"
                style={{ color: 'var(--color, #ecefee)' }}
              >
                <strong
                  style={{ color: 'var(--color, #ecefee)', fontWeight: 700 }}
                >
                  {it.who}
                </strong>{' '}
                <span style={{ color: 'var(--textSecondary, #8e9196)' }}>
                  {it.what}
                </span>
              </span>
              {it.when ? (
                <span
                  className="ticker-when shrink-0 text-[12px]"
                  style={{ color: 'var(--textSecondary, #8e9196)' }}
                >
                  {it.when}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

ActivityTicker.displayName = 'ActivityTicker';

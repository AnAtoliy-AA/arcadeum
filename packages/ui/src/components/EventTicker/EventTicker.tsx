'use client';
import { useEffect, useState } from 'react';
import { LiveChip } from '../LiveChip/LiveChip';
import { cx } from '../../utils/cx';

export type TickerEvent = {
  who: string;
  what: string;
  color?: string;
};

export type EventTickerProps = {
  events: TickerEvent[];
  intervalMs?: number;
  liveLabel?: string;
  testID?: string;
  'data-testid'?: string;
  className?: string;
};

const RootClasses = [
  'box-border',
  'flex',
  'flex-row',
  'items-center',
  'gap-3',
  'px-3',
  'py-2',
  'rounded-xl',
  'border',
  'border-[var(--borderColor)]',
  'bg-[rgba(255,255,255,0.02)]',
  'overflow-hidden',
].join(' ');

export function EventTicker({
  events,
  intervalMs = 2800,
  liveLabel = 'Live',
  testID,
  'data-testid': dataTestId,
  className,
}: EventTickerProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (events.length < 2) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % events.length),
      intervalMs,
    );
    return () => clearInterval(id);
  }, [events.length, intervalMs]);

  if (!events.length) return null;
  const current = events[index] ?? events[0];
  if (!current) return null;

  return (
    <div
      data-testid={dataTestId ?? testID}
      className={cx(RootClasses, className)}
    >
      <LiveChip label={liveLabel} />
      <span
        className="h-[6px] w-[6px] rounded-[3px]"
        style={{ backgroundColor: current.color ?? '#ec4899' }}
      />
      <span
        className="line-clamp-1 text-[16px] font-bold"
        style={{ color: current.color ?? 'var(--mythicAccent)' }}
      >
        {current.who}
      </span>
      <span className="line-clamp-1 flex-1 text-[16px] opacity-[0.85]">
        {current.what}
      </span>
    </div>
  );
}

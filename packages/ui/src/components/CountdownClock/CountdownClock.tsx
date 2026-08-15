'use client';
import { useEffect, useState } from 'react';

export type CountdownClockProps = {
  targetIso: string;
  variant?: 'compact' | 'full';
  onComplete?: () => void;
  testID?: string;
  'data-testid'?: string;
};

const pad = (n: number) => String(Math.max(0, n)).padStart(2, '0');

export function CountdownClock({
  targetIso,
  variant = 'full',
  onComplete,
  testID,
  'data-testid': dataTestId,
}: CountdownClockProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const target = new Date(targetIso).getTime();
  const remaining = Math.max(0, target - now);

  useEffect(() => {
    if (remaining === 0) onComplete?.();
  }, [remaining, onComplete]);

  const d = Math.floor(remaining / 86_400_000);
  const h = Math.floor((remaining / 3_600_000) % 24);
  const m = Math.floor((remaining / 60_000) % 60);
  const s = Math.floor((remaining / 1000) % 60);

  const testId = dataTestId ?? testID;

  if (variant === 'compact') {
    return (
      <span
        className="text-[20px] font-bold tracking-[1px]"
        data-testid={testId}
        aria-label={`${d} days ${h} hours ${m} minutes`}
      >
        {`${pad(h + d * 24)}:${pad(m)}:${pad(s)}`}
      </span>
    );
  }

  return (
    <div className="flex flex-row gap-2" data-testid={testId}>
      {(
        [
          ['D', d],
          ['H', h],
          ['M', m],
          ['S', s],
        ] as const
      ).map(([k, v]) => (
        <div
          key={k}
          className="flex flex-col items-center rounded-lg border border-[var(--borderColor)] bg-[rgba(255,255,255,0.04)] px-3 py-2 min-w-[56px]"
        >
          <span className="text-[28px] font-bold tracking-[1px]">{pad(v)}</span>
          <span className="text-[12px] opacity-70">{k}</span>
        </div>
      ))}
    </div>
  );
}

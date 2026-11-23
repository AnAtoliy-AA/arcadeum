import type { ReactNode } from 'react';
import Link from 'next/link';

export type LivePulseTone = 'emerald' | 'amber' | 'indigo' | 'fuchsia' | 'cyan';

const TONES: Record<
  LivePulseTone,
  { card: string; label: string; badge: string; action: string }
> = {
  emerald: {
    card: 'border-emerald-500/25 from-emerald-950/25',
    label: 'text-emerald-300',
    badge: 'bg-emerald-500/15 text-emerald-300',
    action:
      'border-emerald-400/40 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25',
  },
  amber: {
    card: 'border-amber-500/25 from-amber-950/25',
    label: 'text-amber-300',
    badge: 'bg-amber-500/15 text-amber-300',
    action:
      'border-amber-400/40 bg-amber-500/15 text-amber-100 hover:bg-amber-500/25',
  },
  indigo: {
    card: 'border-indigo-500/30 from-indigo-950/25',
    label: 'text-indigo-300',
    badge: 'bg-indigo-500/15 text-indigo-300',
    action:
      'border-indigo-400/40 bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/30',
  },
  fuchsia: {
    card: 'border-fuchsia-500/25 from-fuchsia-950/25',
    label: 'text-fuchsia-300',
    badge: 'bg-fuchsia-500/15 text-fuchsia-300',
    action:
      'border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-100 hover:bg-fuchsia-500/25',
  },
  cyan: {
    card: 'border-cyan-500/25 from-cyan-950/25',
    label: 'text-cyan-300',
    badge: 'bg-cyan-500/15 text-cyan-300',
    action:
      'border-cyan-400/40 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/25',
  },
};

export const LIVE_PULSE_ACTION_BASE =
  'inline-flex min-h-[40px] w-full items-center justify-center gap-1 rounded-xl border px-3 py-2 text-center text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70';

interface LivePulseCardProps {
  tone: LivePulseTone;
  testId: string;
  label: string;
  icon: string;
  /** Pre-formatted value, or a placeholder dash while stats are unknown. */
  value: string;
  counterTestId: string;
  /** Plain-words explanation shown under the number (changes when empty). */
  description: string;
  empty?: boolean;
  className?: string;
  /** One obvious next action (link or button) built by the caller. */
  children?: ReactNode;
}

/**
 * A single Live Platform Activity card: number, what it means in plain
 * words, and one next action. Never an arrow-only dead end.
 */
export function LivePulseCard({
  tone,
  testId,
  label,
  icon,
  value,
  counterTestId,
  description,
  empty = false,
  className = '',
  children,
}: LivePulseCardProps) {
  const c = TONES[tone];
  return (
    <div
      data-testid={testId}
      data-empty={empty ? 'true' : 'false'}
      className={`relative flex min-w-0 flex-col justify-between gap-3 overflow-hidden rounded-2xl border bg-gradient-to-b to-black/30 p-4 ${c.card} ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span
            className={`min-w-0 break-words text-[11px] font-bold uppercase tracking-wider ${c.label}`}
          >
            {label}
          </span>
          <span
            aria-hidden
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${c.badge}`}
          >
            {icon}
          </span>
        </div>
        <div
          data-testid={counterTestId}
          className="mt-3 font-mono text-2xl font-black text-white md:text-3xl"
        >
          {value}
        </div>
        <p className="mt-1 break-words text-xs font-medium leading-snug text-white/80">
          {description}
        </p>
      </div>
      {children ? <div className="flex flex-col gap-2">{children}</div> : null}
    </div>
  );
}

export function LivePulseLinkAction({
  tone,
  href,
  children,
  testId,
}: {
  tone: LivePulseTone;
  href: string;
  children: ReactNode;
  testId?: string;
}) {
  return (
    <Link
      href={href}
      data-testid={testId}
      className={`${LIVE_PULSE_ACTION_BASE} ${TONES[tone].action}`}
    >
      {children}
    </Link>
  );
}

export function livePulseActionClass(tone: LivePulseTone): string {
  return `${LIVE_PULSE_ACTION_BASE} ${TONES[tone].action}`;
}

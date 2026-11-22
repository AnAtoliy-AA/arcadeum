import type { ReactNode } from 'react';

const base = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
};

export function UsersIcon() {
  return (
    <svg {...base}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function ClockIcon() {
  return (
    <svg {...base}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

export function GaugeIcon() {
  return (
    <svg {...base}>
      <path d="m12 14 4-4" />
      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
    </svg>
  );
}

export function ArrowRightIcon() {
  return (
    <svg {...base} width={14} height={14}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function ChevronDownIcon() {
  return (
    <svg {...base} width={18} height={18}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export const FACT_ICONS: Record<string, ReactNode> = {
  players: <UsersIcon />,
  duration: <ClockIcon />,
  difficulty: <GaugeIcon />,
};

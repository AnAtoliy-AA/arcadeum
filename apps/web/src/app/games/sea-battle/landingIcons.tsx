import type { ReactElement } from 'react';

const COMMON = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const PATHS: Record<string, ReactElement> = {
  users: (
    <>
      <circle cx="9" cy="8" r="3.25" />
      <path d="M3 19c0-3 2.7-5 6-5s6 2 6 5" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15.5 14.2c2.4.5 4.5 2.2 4.5 4.8" />
    </>
  ),
  flag: (
    <>
      <path d="M5 21V4" />
      <path d="M5 4h11l-2 4 2 4H5" />
    </>
  ),
  palette: (
    <>
      <path d="M12 3a9 9 0 1 0 4 17c1.5-.6 1-2.4-.6-2.4H14a2 2 0 0 1-2-2c0-1.7 1.5-2 3-2h2a4 4 0 0 0 4-4 7 7 0 0 0-9-6.6Z" />
      <circle cx="8" cy="11" r="1" />
      <circle cx="12" cy="7.5" r="1" />
      <circle cx="16" cy="10" r="1" />
    </>
  ),
  bolt: <path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z" />,
  door: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <circle cx="15" cy="12" r="1" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
      <path d="M5 6H3v2a3 3 0 0 0 3 3M19 6h2v2a3 3 0 0 1-3 3" />
      <path d="M10 14h4l1 5H9l1-5Z" />
      <path d="M7 21h10" />
    </>
  ),
  check: <path d="M5 12.5 10 17 19 7" />,
};

export function Icon({ name }: { name: string }) {
  const path = PATHS[name];
  if (!path) return null;
  return <svg {...COMMON}>{path}</svg>;
}

export const HIGHLIGHT_ICONS: Record<string, string> = {
  players: 'users',
  teams: 'flag',
  themes: 'palette',
  free: 'bolt',
};

export const STEP_ICONS = ['door', 'grid', 'target', 'trophy'];

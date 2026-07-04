/**
 * Media transport icons (solid glyphs) — used by the in-game music mini-player
 * and any future audio/video controls.
 */

export const PlayIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 4.5v15a1 1 0 0 0 1.54.84l11.5-7.5a1 1 0 0 0 0-1.68L8.54 3.66A1 1 0 0 0 7 4.5Z" />
  </svg>
);

export const PauseIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
);

export const StopIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="5" y="5" width="14" height="14" rx="2" />
  </svg>
);

export const SkipBackIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.5 4.6 10 11.3V5a1 1 0 0 0-2 0v14a1 1 0 0 0 2 0v-6.3l9.5 6.7A1 1 0 0 0 21 18.6V5.4a1 1 0 0 0-1.5-.8Z" />
  </svg>
);

export const SkipForwardIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.5 4.6 14 11.3V5a1 1 0 0 1 2 0v14a1 1 0 0 1-2 0v-6.3l-9.5 6.7A1 1 0 0 1 3 18.6V5.4a1 1 0 0 1 1.5-.8Z" />
  </svg>
);

export const ShuffleIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.5 3.75a1.5 1.5 0 1 1 3 0v3.19l2.33-2.33a.75.75 0 1 1 1.06 1.06l-3.58 3.58a.75.75 0 0 1 0 1.06l3.58 3.58a.75.75 0 1 1-1.06 1.06L19.5 11.31V14.5a1.5 1.5 0 0 1-3 0V6.75l-4.63 4.63a.75.75 0 0 1-1.06 0L6.15 7.59a.75.75 0 0 1 1.06-1.06l4.23 4.24V3.75a1.5 1.5 0 0 1 3 0ZM2.25 17.25a.75.75 0 0 1 .75.75v1.5a1.5 1.5 0 0 0 1.5 1.5h.75a.75.75 0 0 1 0 1.5H4.5a3 3 0 0 1-3-3v-1.5a.75.75 0 0 1 .75-.75Zm0-10.5a.75.75 0 0 1 .75-.75h.75a1.5 1.5 0 0 1 1.5 1.5V8.25a.75.75 0 0 1-1.5 0H3a.75.75 0 0 1-.75-.75Z" />
  </svg>
);

export const RepeatIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.44 2.56a.75.75 0 0 1 .04 1.06l-1.39 1.56H18a4.5 4.5 0 0 1 0 9H6.75a.75.75 0 0 1 0-1.5H18a3 3 0 0 0 0-6h-1.91l1.39 1.56a.75.75 0 1 1-1.12 1L13.2 8.13a.75.75 0 0 1 0-1.06l3.11-3.51a.75.75 0 0 1 1.12 0ZM6.56 18.44a.75.75 0 0 1-.04-1.06l1.39-1.56H6A4.5 4.5 0 0 1 6 14.3h11.25a.75.75 0 0 1 0 1.5H6a3 3 0 0 0 0 6h1.91l-1.39-1.56a.75.75 0 0 1 1.12-1l3.11 3.51a.75.75 0 0 1 0 1.06l-3.11 3.51a.75.75 0 0 1-1.12-1Z" />
  </svg>
);

export const RepeatOneIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.44 2.56a.75.75 0 0 1 .04 1.06l-1.39 1.56H18a4.5 4.5 0 0 1 0 9H6.75a.75.75 0 0 1 0-1.5H18a3 3 0 0 0 0-6h-1.91l1.39 1.56a.75.75 0 1 1-1.12 1L13.2 8.13a.75.75 0 0 1 0-1.06l3.11-3.51a.75.75 0 0 1 1.12 0ZM6.56 18.44a.75.75 0 0 1-.04-1.06l1.39-1.56H6A4.5 4.5 0 0 1 6 14.3h11.25a.75.75 0 0 1 0 1.5H6a3 3 0 0 0 0 6h1.91l-1.39-1.56a.75.75 0 0 1 1.12-1l3.11 3.51a.75.75 0 0 1 0 1.06l-3.11 3.51a.75.75 0 0 1-1.12-1ZM10.5 15.75a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Z" />
  </svg>
);

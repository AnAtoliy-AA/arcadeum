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

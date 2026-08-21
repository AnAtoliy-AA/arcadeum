import React from 'react';

interface MarkGlyphProps {
  mark: string;
  color: string;
}

export function MarkGlyph({ mark, color }: MarkGlyphProps) {
  if (mark === 'X') {
    return (
      <span className="relative flex items-center justify-center w-full h-full">
        <span className="sr-only">{mark}</span>
        <svg
          viewBox="0 0 32 32"
          className="w-[66%] h-[66%] select-none"
          style={{ color, filter: 'drop-shadow(0 0 6px currentColor)' }}
          aria-hidden="true"
        >
          <line
            x1="6"
            y1="6"
            x2="26"
            y2="26"
            stroke="currentColor"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <line
            x1="26"
            y1="6"
            x2="6"
            y2="26"
            stroke="currentColor"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }
  if (mark === 'O') {
    return (
      <span className="relative flex items-center justify-center w-full h-full">
        <span className="sr-only">{mark}</span>
        <svg
          viewBox="0 0 32 32"
          className="w-[66%] h-[66%] select-none"
          style={{ color, filter: 'drop-shadow(0 0 6px currentColor)' }}
          aria-hidden="true"
        >
          <circle
            cx="16"
            cy="16"
            r="10.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="4.5"
          />
        </svg>
      </span>
    );
  }
  return (
    <span
      className="ttt-mark select-none"
      style={{ color, filter: 'drop-shadow(0 0 6px currentColor)' }}
    >
      {mark}
    </span>
  );
}

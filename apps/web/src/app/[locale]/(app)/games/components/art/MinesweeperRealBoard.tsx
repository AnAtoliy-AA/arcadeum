import React from 'react';

type CellState =
  | { type: 'num'; val: number; color: string }
  | { type: 'empty' }
  | { type: 'flag' }
  | { type: 'unrev' }
  | { type: 'mine' };

const MINES_GRID: CellState[][] = [
  [
    { type: 'num', val: 1, color: '#3b82f6' },
    { type: 'num', val: 2, color: '#22c55e' },
    { type: 'num', val: 1, color: '#3b82f6' },
    { type: 'empty' },
    { type: 'empty' },
    { type: 'num', val: 1, color: '#3b82f6' },
    { type: 'unrev' },
    { type: 'unrev' },
    { type: 'unrev' },
  ],
  [
    { type: 'num', val: 3, color: '#ef4444' },
    { type: 'flag' },
    { type: 'num', val: 2, color: '#22c55e' },
    { type: 'empty' },
    { type: 'empty' },
    { type: 'num', val: 1, color: '#3b82f6' },
    { type: 'flag' },
    { type: 'num', val: 4, color: '#a855f7' },
    { type: 'unrev' },
  ],
  [
    { type: 'num', val: 2, color: '#22c55e' },
    { type: 'num', val: 3, color: '#ef4444' },
    { type: 'num', val: 1, color: '#3b82f6' },
    { type: 'empty' },
    { type: 'empty' },
    { type: 'num', val: 1, color: '#3b82f6' },
    { type: 'num', val: 2, color: '#22c55e' },
    { type: 'mine' },
    { type: 'num', val: 2, color: '#22c55e' },
  ],
  [
    { type: 'empty' },
    { type: 'num', val: 1, color: '#3b82f6' },
    { type: 'num', val: 1, color: '#3b82f6' },
    { type: 'empty' },
    { type: 'empty' },
    { type: 'empty' },
    { type: 'num', val: 1, color: '#3b82f6' },
    { type: 'num', val: 1, color: '#3b82f6' },
    { type: 'num', val: 1, color: '#3b82f6' },
  ],
  [
    { type: 'empty' },
    { type: 'empty' },
    { type: 'empty' },
    { type: 'empty' },
    { type: 'empty' },
    { type: 'empty' },
    { type: 'empty' },
    { type: 'empty' },
    { type: 'empty' },
  ],
  [
    { type: 'unrev' },
    { type: 'unrev' },
    { type: 'unrev' },
    { type: 'unrev' },
    { type: 'unrev' },
    { type: 'unrev' },
    { type: 'unrev' },
    { type: 'unrev' },
    { type: 'unrev' },
  ],
  [
    { type: 'unrev' },
    { type: 'unrev' },
    { type: 'unrev' },
    { type: 'unrev' },
    { type: 'unrev' },
    { type: 'unrev' },
    { type: 'unrev' },
    { type: 'unrev' },
    { type: 'unrev' },
  ],
];

export function MinesweeperRealBoard() {
  return (
    <svg
      viewBox="0 0 360 220"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full select-none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="ms-glow" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
          <stop offset="60%" stopColor="#991b1b" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#030712" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ms-tile-unrev" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="ms-tile-rev" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#0b0f19" />
        </linearGradient>
        <filter id="ms-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="3"
            floodColor="#000000"
            floodOpacity="0.85"
          />
        </filter>
      </defs>

      <rect width="360" height="220" fill="#030712" />
      <rect width="360" height="220" fill="url(#ms-glow)" />

      <g transform="translate(90 14)" filter="url(#ms-shadow)">
        <rect
          x="-8"
          y="-8"
          width="196"
          height="200"
          rx="8"
          fill="#0f172a"
          stroke="#334155"
          strokeWidth="2"
        />
        <rect
          x="0"
          y="0"
          width="180"
          height="32"
          rx="5"
          fill="#020617"
          stroke="#1e293b"
          strokeWidth="1"
        />

        <rect x="6" y="5" width="40" height="22" rx="3" fill="#090d16" />
        <text
          x="26"
          y="20"
          textAnchor="middle"
          fill="#ef4444"
          fontSize="14"
          fontWeight="bold"
          fontFamily="monospace"
          letterSpacing="2"
        >
          010
        </text>

        <g transform="translate(90 16)">
          <circle
            cx="0"
            cy="0"
            r="11"
            fill="#facc15"
            stroke="#ca8a04"
            strokeWidth="1.5"
          />
          <circle cx="-3.5" cy="-2.5" r="1.5" fill="#000000" />
          <circle cx="3.5" cy="-2.5" r="1.5" fill="#000000" />
          <path
            d="M -5 3 Q 0 8 5 3"
            fill="none"
            stroke="#000000"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>

        <rect x="134" y="5" width="40" height="22" rx="3" fill="#090d16" />
        <text
          x="154"
          y="20"
          textAnchor="middle"
          fill="#ef4444"
          fontSize="14"
          fontWeight="bold"
          fontFamily="monospace"
          letterSpacing="2"
        >
          042
        </text>

        <g transform="translate(0 38)">
          <rect
            width="180"
            height="150"
            rx="4"
            fill="#0b0f19"
            stroke="#1e293b"
            strokeWidth="1"
          />

          {MINES_GRID.map((row, r) =>
            row.map((cell, c) => {
              const x = 6 + c * 19;
              const y = 6 + r * 19;
              return (
                <g key={`ms-${r}-${c}`} transform={`translate(${x} ${y})`}>
                  {cell.type === 'unrev' ? (
                    <rect
                      width="18"
                      height="18"
                      rx="2"
                      fill="url(#ms-tile-unrev)"
                      stroke="#475569"
                      strokeWidth="0.6"
                    />
                  ) : cell.type === 'mine' ? (
                    <>
                      <rect
                        width="18"
                        height="18"
                        rx="2"
                        fill="#7f1d1d"
                        stroke="#ef4444"
                        strokeWidth="0.8"
                      />
                      <circle
                        cx="9"
                        cy="9"
                        r="4.5"
                        fill="#000000"
                        stroke="#f59e0b"
                        strokeWidth="0.5"
                      />
                      <line
                        x1="9"
                        y1="3"
                        x2="9"
                        y2="15"
                        stroke="#f59e0b"
                        strokeWidth="1"
                      />
                      <line
                        x1="3"
                        y1="9"
                        x2="15"
                        y2="9"
                        stroke="#f59e0b"
                        strokeWidth="1"
                      />
                    </>
                  ) : cell.type === 'flag' ? (
                    <>
                      <rect
                        width="18"
                        height="18"
                        rx="2"
                        fill="url(#ms-tile-unrev)"
                        stroke="#475569"
                        strokeWidth="0.6"
                      />
                      <path
                        d="M 5 14 L 7 14 L 7 5 L 14 8 L 7 11"
                        fill="#ef4444"
                        stroke="#dc2626"
                        strokeWidth="0.5"
                      />
                      <rect x="4" y="13" width="7" height="2" fill="#94a3b8" />
                    </>
                  ) : (
                    <>
                      <rect
                        width="18"
                        height="18"
                        rx="2"
                        fill="url(#ms-tile-rev)"
                        stroke="#1e293b"
                        strokeWidth="0.5"
                      />
                      {cell.type === 'num' && (
                        <text
                          x="9"
                          y="13.5"
                          textAnchor="middle"
                          fill={cell.color}
                          fontSize="12"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          {cell.val}
                        </text>
                      )}
                    </>
                  )}
                </g>
              );
            }),
          )}
        </g>
      </g>

      <g transform="translate(16 90)">
        <rect
          width="54"
          height="36"
          rx="6"
          fill="#1e1b4b"
          stroke="#6366f1"
          strokeWidth="1"
          opacity="0.9"
        />
        <text
          x="27"
          y="15"
          textAnchor="middle"
          fill="#a5b4fc"
          fontSize="7.5"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          SWEEPER
        </text>
        <text
          x="27"
          y="27"
          textAnchor="middle"
          fill="#e0e7ff"
          fontSize="6.5"
          fontFamily="sans-serif"
        >
          Flag & Clear
        </text>
      </g>

      <g transform="translate(290 90)">
        <rect
          width="54"
          height="36"
          rx="6"
          fill="#450a0a"
          stroke="#ef4444"
          strokeWidth="1"
          opacity="0.9"
        />
        <text
          x="27"
          y="15"
          textAnchor="middle"
          fill="#fca5a5"
          fontSize="7.5"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          99 MINES
        </text>
        <text
          x="27"
          y="27"
          textAnchor="middle"
          fill="#fee2e2"
          fontSize="6.5"
          fontFamily="sans-serif"
        >
          Expert Grid
        </text>
      </g>
    </svg>
  );
}

import React from 'react';

const GRID_SIZE = 9;
const CELL_SIZE = 19;
const BOARD_OFFSET = 14;

const BLACK_STONES: Array<[number, number]> = [
  [2, 2],
  [2, 3],
  [3, 2],
  [5, 6],
  [6, 5],
  [6, 6],
  [6, 7],
  [7, 6],
  [2, 6],
  [3, 7],
  [4, 4],
];

const WHITE_STONES: Array<[number, number]> = [
  [2, 4],
  [3, 3],
  [3, 4],
  [5, 5],
  [5, 7],
  [7, 5],
  [7, 7],
  [1, 6],
  [2, 7],
  [6, 2],
  [6, 3],
];

const STAR_POINTS: Array<[number, number]> = [
  [2, 2],
  [2, 6],
  [4, 4],
  [6, 2],
  [6, 6],
];

export function GoRealBoard() {
  return (
    <svg
      viewBox="0 0 360 220"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full select-none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="go-board-glow" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.25" />
          <stop offset="60%" stopColor="#4c1d95" stopOpacity="0.07" />
          <stop offset="100%" stopColor="#080312" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="go-black-stone" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#3f3f46" />
          <stop offset="40%" stopColor="#18181b" />
          <stop offset="100%" stopColor="#09090b" />
        </radialGradient>
        <radialGradient id="go-white-stone" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#e4e4e7" />
          <stop offset="100%" stopColor="#a1a1aa" />
        </radialGradient>
        <filter
          id="go-stone-shadow"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feDropShadow
            dx="0"
            dy="2.5"
            stdDeviation="2"
            floodColor="#000000"
            floodOpacity="0.8"
          />
        </filter>
      </defs>

      <rect width="360" height="220" fill="#090414" />
      <rect width="360" height="220" fill="url(#go-board-glow)" />

      <g transform="translate(90 20)">
        <rect
          x="0"
          y="0"
          width="180"
          height="180"
          rx="10"
          fill="#1c1328"
          stroke="#7c3aed"
          strokeWidth="2"
        />

        <rect
          x="4"
          y="4"
          width="172"
          height="172"
          rx="7"
          fill="#130b1e"
          stroke="#3b1d60"
          strokeWidth="1"
        />

        {Array.from({ length: GRID_SIZE }).map((_, i) => {
          const pos = BOARD_OFFSET + i * CELL_SIZE;
          return (
            <React.Fragment key={`grid-${i}`}>
              <line
                x1={pos}
                y1={BOARD_OFFSET}
                x2={pos}
                y2={BOARD_OFFSET + (GRID_SIZE - 1) * CELL_SIZE}
                stroke="#6b4499"
                strokeWidth="1"
                opacity="0.8"
              />
              <line
                x1={BOARD_OFFSET}
                y1={pos}
                x2={BOARD_OFFSET + (GRID_SIZE - 1) * CELL_SIZE}
                y2={pos}
                stroke="#6b4499"
                strokeWidth="1"
                opacity="0.8"
              />
            </React.Fragment>
          );
        })}

        {STAR_POINTS.map(([r, c]) => (
          <circle
            key={`star-${r}-${c}`}
            cx={BOARD_OFFSET + c * CELL_SIZE}
            cy={BOARD_OFFSET + r * CELL_SIZE}
            r="2"
            fill="#a78bfa"
          />
        ))}

        <circle
          cx={BOARD_OFFSET + 4 * CELL_SIZE}
          cy={BOARD_OFFSET + 4 * CELL_SIZE}
          r="10"
          fill="none"
          stroke="#a855f7"
          strokeWidth="1"
          strokeDasharray="2 2"
          opacity="0.6"
        />

        {BLACK_STONES.map(([r, c]) => (
          <circle
            key={`black-${r}-${c}`}
            cx={BOARD_OFFSET + c * CELL_SIZE}
            cy={BOARD_OFFSET + r * CELL_SIZE}
            r="7.5"
            fill="url(#go-black-stone)"
            stroke="#52525b"
            strokeWidth="0.6"
            filter="url(#go-stone-shadow)"
          />
        ))}

        {WHITE_STONES.map(([r, c]) => (
          <circle
            key={`white-${r}-${c}`}
            cx={BOARD_OFFSET + c * CELL_SIZE}
            cy={BOARD_OFFSET + r * CELL_SIZE}
            r="7.5"
            fill="url(#go-white-stone)"
            stroke="#ffffff"
            strokeWidth="0.6"
            filter="url(#go-stone-shadow)"
          />
        ))}

        <circle
          cx={BOARD_OFFSET + 3 * CELL_SIZE}
          cy={BOARD_OFFSET + 3 * CELL_SIZE}
          r="3"
          fill="#ef4444"
          opacity="0.85"
        />
      </g>

      <g transform="translate(16 88)">
        <rect
          width="56"
          height="38"
          rx="6"
          fill="#1c1328"
          stroke="#7c3aed"
          strokeWidth="1"
          opacity="0.9"
        />
        <text
          x="28"
          y="16"
          textAnchor="middle"
          fill="#c084fc"
          fontSize="8"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          LIBERTIES
        </text>
        <text
          x="28"
          y="28"
          textAnchor="middle"
          fill="#e9d5ff"
          fontSize="7"
          fontFamily="sans-serif"
        >
          Eyes & Ko
        </text>
      </g>

      <g transform="translate(288 88)">
        <rect
          width="56"
          height="38"
          rx="6"
          fill="#1c1328"
          stroke="#9333ea"
          strokeWidth="1"
          opacity="0.9"
        />
        <text
          x="28"
          y="16"
          textAnchor="middle"
          fill="#d8b4fe"
          fontSize="8"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          TERRITORY
        </text>
        <text
          x="28"
          y="28"
          textAnchor="middle"
          fill="#f3e8ff"
          fontSize="7"
          fontFamily="sans-serif"
        >
          Area Scoring
        </text>
      </g>
    </svg>
  );
}

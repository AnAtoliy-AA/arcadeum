import React from 'react';

const SUDOKU_GRID = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

export function SudokuRealBoard() {
  return (
    <svg
      viewBox="0 0 360 220"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full select-none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="sdk-glow" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" />
          <stop offset="60%" stopColor="#0369a1" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#030712" stopOpacity="0" />
        </radialGradient>
        <filter id="sdk-shadow" x="-20%" y="-20%" width="140%" height="140%">
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
      <rect width="360" height="220" fill="url(#sdk-glow)" />

      <g transform="translate(99 19)" filter="url(#sdk-shadow)">
        <rect
          x="-6"
          y="-6"
          width="174"
          height="174"
          rx="10"
          fill="#0b132b"
          stroke="#0284c7"
          strokeWidth="1.8"
        />

        <rect
          x="72"
          y="0"
          width="18"
          height="162"
          fill="#0284c7"
          fillOpacity="0.1"
        />
        <rect
          x="0"
          y="90"
          width="162"
          height="18"
          fill="#0284c7"
          fillOpacity="0.1"
        />

        <g transform="translate(18 54)">
          <rect
            width="18"
            height="18"
            fill="#38bdf8"
            fillOpacity="0.2"
            stroke="#38bdf8"
            strokeWidth="1.2"
          />
          <text x="4" y="7" fill="#94a3b8" fontSize="5" fontFamily="monospace">
            1
          </text>
          <text x="14" y="7" fill="#94a3b8" fontSize="5" fontFamily="monospace">
            2
          </text>
          <text x="9" y="15" fill="#94a3b8" fontSize="5" fontFamily="monospace">
            5
          </text>
        </g>

        {SUDOKU_GRID.map((row, r) =>
          row.map((val, c) => {
            const x = c * 18;
            const y = r * 18;
            const isHighlight = val === 7;
            return (
              <g key={`sdk-cell-${r}-${c}`}>
                {isHighlight && (
                  <rect
                    x={x + 1}
                    y={y + 1}
                    width="16"
                    height="16"
                    rx="3"
                    fill="#38bdf8"
                    fillOpacity="0.3"
                  />
                )}
                {val > 0 && (
                  <text
                    x={x + 9}
                    y={y + 13}
                    textAnchor="middle"
                    fill={isHighlight ? '#38bdf8' : '#f8fafc'}
                    fontSize="11.5"
                    fontWeight={isHighlight ? 'bold' : '600'}
                    fontFamily="sans-serif"
                  >
                    {val}
                  </text>
                )}
              </g>
            );
          }),
        )}

        {Array.from({ length: 10 }).map((_, i) => {
          const isThick = i % 3 === 0;
          const pos = i * 18;
          return (
            <React.Fragment key={`sdk-lines-${i}`}>
              <line
                x1={pos}
                y1="0"
                x2={pos}
                y2="162"
                stroke={isThick ? '#38bdf8' : '#1e293b'}
                strokeWidth={isThick ? 1.8 : 0.6}
              />
              <line
                x1="0"
                y1={pos}
                x2="162"
                y2={pos}
                stroke={isThick ? '#38bdf8' : '#1e293b'}
                strokeWidth={isThick ? 1.8 : 0.6}
              />
            </React.Fragment>
          );
        })}
      </g>

      <g transform="translate(18 90)">
        <rect
          width="54"
          height="36"
          rx="6"
          fill="#0c4a6e"
          stroke="#0284c7"
          strokeWidth="1"
          opacity="0.9"
        />
        <text
          x="27"
          y="15"
          textAnchor="middle"
          fill="#7dd3fc"
          fontSize="7.5"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          SUDOKU
        </text>
        <text
          x="27"
          y="27"
          textAnchor="middle"
          fill="#e0f2fe"
          fontSize="6.5"
          fontFamily="sans-serif"
        >
          9×9 Matrix
        </text>
      </g>

      <g transform="translate(288 90)">
        <rect
          width="54"
          height="36"
          rx="6"
          fill="#0c4a6e"
          stroke="#0284c7"
          strokeWidth="1"
          opacity="0.9"
        />
        <text
          x="27"
          y="15"
          textAnchor="middle"
          fill="#7dd3fc"
          fontSize="7.5"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          PENCIL
        </text>
        <text
          x="27"
          y="27"
          textAnchor="middle"
          fill="#e0f2fe"
          fontSize="6.5"
          fontFamily="sans-serif"
        >
          Auto Notes
        </text>
      </g>
    </svg>
  );
}

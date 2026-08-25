import React from 'react';

interface TileData {
  val: number;
  bg: string;
  fg: string;
  size: number;
  glow?: boolean;
}

const TILES: (TileData | null)[][] = [
  [
    { val: 2, bg: '#eee4da', fg: '#776e65', size: 16 },
    { val: 4, bg: '#ede0c8', fg: '#776e65', size: 16 },
    { val: 8, bg: '#f2b179', fg: '#f9f6f2', size: 16 },
    { val: 16, bg: '#f59563', fg: '#f9f6f2', size: 15 },
  ],
  [
    { val: 32, bg: '#f67c5f', fg: '#f9f6f2', size: 15 },
    { val: 64, bg: '#f65e3b', fg: '#f9f6f2', size: 15 },
    { val: 128, bg: '#edcf72', fg: '#f9f6f2', size: 13, glow: true },
    { val: 256, bg: '#edcc61', fg: '#f9f6f2', size: 13, glow: true },
  ],
  [
    { val: 512, bg: '#edc850', fg: '#f9f6f2', size: 13, glow: true },
    { val: 1024, bg: '#edc53f', fg: '#f9f6f2', size: 10.5, glow: true },
    { val: 2048, bg: '#edc22e', fg: '#ffffff', size: 10.5, glow: true },
    null,
  ],
  [
    null,
    { val: 2, bg: '#eee4da', fg: '#776e65', size: 16 },
    { val: 4, bg: '#ede0c8', fg: '#776e65', size: 16 },
    null,
  ],
];

export function Game2048RealBoard() {
  return (
    <svg
      viewBox="0 0 360 220"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full select-none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="g2048-glow" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.28" />
          <stop offset="60%" stopColor="#b45309" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#0d0702" stopOpacity="0" />
        </radialGradient>
        <filter id="g2048-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="3"
            floodColor="#000000"
            floodOpacity="0.85"
          />
        </filter>
        <filter
          id="g2048-tile-glow"
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
        >
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation="4"
            floodColor="#f59e0b"
            floodOpacity="0.75"
          />
        </filter>
      </defs>

      <rect width="360" height="220" fill="#0d0702" />
      <rect width="360" height="220" fill="url(#g2048-glow)" />

      <g transform="translate(98 14)" filter="url(#g2048-shadow)">
        <rect
          x="-6"
          y="-6"
          width="176"
          height="198"
          rx="10"
          fill="#1c1917"
          stroke="#78350f"
          strokeWidth="1.5"
        />

        <rect x="0" y="0" width="164" height="28" rx="5" fill="#292524" />

        <g transform="translate(6 4)">
          <rect width="48" height="20" rx="3" fill="#44403c" />
          <text
            x="24"
            y="7.5"
            textAnchor="middle"
            fill="#d6d3d1"
            fontSize="5.5"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            SCORE
          </text>
          <text
            x="24"
            y="16.5"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="8.5"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            24,860
          </text>
        </g>

        <g transform="translate(110 4)">
          <rect width="48" height="20" rx="3" fill="#44403c" />
          <text
            x="24"
            y="7.5"
            textAnchor="middle"
            fill="#d6d3d1"
            fontSize="5.5"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            BEST
          </text>
          <text
            x="24"
            y="16.5"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="8.5"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            32,440
          </text>
        </g>

        <g transform="translate(0 34)">
          <rect width="164" height="152" rx="6" fill="#292524" />

          {TILES.map((row, r) =>
            row.map((tile, c) => {
              const x = 7 + c * 38;
              const y = 6 + r * 36;
              return (
                <g key={`tile-${r}-${c}`}>
                  <rect
                    x={x}
                    y={y}
                    width="34"
                    height="32"
                    rx="4"
                    fill={tile ? tile.bg : '#44403c'}
                    fillOpacity={tile ? 1 : 0.4}
                    filter={tile?.glow ? 'url(#g2048-tile-glow)' : undefined}
                  />
                  {tile && (
                    <text
                      x={x + 17}
                      y={y + 20}
                      textAnchor="middle"
                      fill={tile.fg}
                      fontSize={tile.size}
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      {tile.val}
                    </text>
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
          fill="#451a03"
          stroke="#f59e0b"
          strokeWidth="1"
          opacity="0.9"
        />
        <text
          x="27"
          y="15"
          textAnchor="middle"
          fill="#fbbf24"
          fontSize="7.5"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          2048 TILE
        </text>
        <text
          x="27"
          y="27"
          textAnchor="middle"
          fill="#fef3c7"
          fontSize="6.5"
          fontFamily="sans-serif"
        >
          Merge to Win
        </text>
      </g>

      <g transform="translate(290 90)">
        <rect
          width="54"
          height="36"
          rx="6"
          fill="#451a03"
          stroke="#f59e0b"
          strokeWidth="1"
          opacity="0.9"
        />
        <text
          x="27"
          y="15"
          textAnchor="middle"
          fill="#fbbf24"
          fontSize="7.5"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          4×4 GRID
        </text>
        <text
          x="27"
          y="27"
          textAnchor="middle"
          fill="#fef3c7"
          fontSize="6.5"
          fontFamily="sans-serif"
        >
          Slide & Combine
        </text>
      </g>
    </svg>
  );
}

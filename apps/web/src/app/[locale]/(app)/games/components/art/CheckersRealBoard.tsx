import React from 'react';

const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export function CheckersRealBoard() {
  return (
    <svg
      viewBox="0 0 360 220"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full select-none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="chk-board-glow" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.22" />
          <stop offset="60%" stopColor="#b45309" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#0a0703" stopOpacity="0" />
        </radialGradient>
        <filter id="chk-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="3"
            floodColor="#000000"
            floodOpacity="0.8"
          />
        </filter>
        <linearGradient id="chk-red-piece" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
        <linearGradient id="chk-white-piece" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fafaf9" />
          <stop offset="100%" stopColor="#d6d3d1" />
        </linearGradient>
      </defs>

      <rect width="360" height="220" fill="#0c0a09" />
      <rect width="360" height="220" fill="url(#chk-board-glow)" />

      {/* Real 8x8 Checkers Board */}
      <g transform="translate(85 15)">
        <rect
          x="-10"
          y="-10"
          width="200"
          height="200"
          rx="8"
          fill="#1c1917"
          stroke="#78350f"
          strokeWidth="2"
        />

        {/* Board squares */}
        {RANKS.map((rank, r) =>
          FILES.map((file, c) => {
            const isDark = (r + c) % 2 === 1;
            const size = 22.5;
            const x = c * size;
            const y = r * size;
            return (
              <rect
                key={`${rank}-${file}`}
                x={x}
                y={y}
                width={size}
                height={size}
                fill={isDark ? '#451a03' : '#fed7aa'}
              />
            );
          }),
        )}

        {/* Coordinates */}
        {FILES.map((file, i) => (
          <text
            key={file}
            x={i * 22.5 + 11.25}
            y="187"
            textAnchor="middle"
            fill="#d97706"
            fontSize="7"
            fontFamily="sans-serif"
            fontWeight="bold"
          >
            {file}
          </text>
        ))}
        {RANKS.map((rank, i) => (
          <text
            key={rank}
            x="-5"
            y={i * 22.5 + 14}
            textAnchor="middle"
            fill="#d97706"
            fontSize="7"
            fontFamily="sans-serif"
            fontWeight="bold"
          >
            {rank}
          </text>
        ))}

        {/* Jump Path / Active move highlight */}
        <line
          x1={3 * 22.5 + 11.25}
          y1={4 * 22.5 + 11.25}
          x2={1 * 22.5 + 11.25}
          y2={2 * 22.5 + 11.25}
          stroke="#f59e0b"
          strokeWidth="2"
          strokeDasharray="3 3"
          opacity="0.8"
        />

        {/* Black / Red Draughts Pieces (Top) */}
        {[
          [0, 1],
          [0, 3],
          [0, 5],
          [0, 7],
          [1, 0],
          [1, 2],
          [1, 4],
          [1, 6],
          [2, 1],
          [2, 5],
          [2, 7],
        ].map(([r, c], i) => (
          <g
            key={`b-${i}`}
            transform={`translate(${c * 22.5 + 11.25} ${r * 22.5 + 11.25})`}
            filter="url(#chk-shadow)"
          >
            <circle
              cx="0"
              cy="0"
              r="8"
              fill="url(#chk-red-piece)"
              stroke="#fecaca"
              strokeWidth="0.8"
            />
            <circle
              cx="0"
              cy="0"
              r="5"
              fill="none"
              stroke="#fca5a5"
              strokeWidth="0.6"
              opacity="0.7"
            />
          </g>
        ))}

        {/* Crowned Red King Piece */}
        <g
          transform={`translate(${3 * 22.5 + 11.25} ${2 * 22.5 + 11.25})`}
          filter="url(#chk-shadow)"
        >
          <circle
            cx="0"
            cy="0"
            r="9"
            fill="url(#chk-red-piece)"
            stroke="#fef08a"
            strokeWidth="1.2"
          />
          <circle
            cx="0"
            cy="0"
            r="6"
            fill="none"
            stroke="#fca5a5"
            strokeWidth="0.6"
          />
          <text
            x="0"
            y="3.5"
            textAnchor="middle"
            fill="#fef08a"
            fontSize="8"
            fontWeight="bold"
          >
            👑
          </text>
        </g>

        {/* White / Ivory Draughts Pieces (Bottom) */}
        {[
          [5, 0],
          [5, 2],
          [5, 4],
          [5, 6],
          [6, 1],
          [6, 3],
          [6, 5],
          [6, 7],
          [7, 0],
          [7, 2],
          [7, 4],
          [7, 6],
        ].map(([r, c], i) => (
          <g
            key={`w-${i}`}
            transform={`translate(${c * 22.5 + 11.25} ${r * 22.5 + 11.25})`}
            filter="url(#chk-shadow)"
          >
            <circle
              cx="0"
              cy="0"
              r="8"
              fill="url(#chk-white-piece)"
              stroke="#78716c"
              strokeWidth="0.8"
            />
            <circle
              cx="0"
              cy="0"
              r="5"
              fill="none"
              stroke="#a8a29e"
              strokeWidth="0.6"
              opacity="0.7"
            />
          </g>
        ))}

        {/* Active White Striking Piece */}
        <g
          transform={`translate(${3 * 22.5 + 11.25} ${4 * 22.5 + 11.25})`}
          filter="url(#chk-shadow)"
        >
          <circle
            cx="0"
            cy="0"
            r="9"
            fill="url(#chk-white-piece)"
            stroke="#f59e0b"
            strokeWidth="1.5"
          />
          <circle
            cx="0"
            cy="0"
            r="5.5"
            fill="none"
            stroke="#a8a29e"
            strokeWidth="0.6"
          />
          <text
            x="0"
            y="3"
            textAnchor="middle"
            fill="#d97706"
            fontSize="7"
            fontWeight="bold"
          >
            ★
          </text>
        </g>
      </g>

      {/* Floating Badges */}
      <g transform="translate(18 90)">
        <rect
          width="52"
          height="38"
          rx="6"
          fill="#1c1917"
          stroke="#f59e0b"
          strokeWidth="1"
          opacity="0.9"
        />
        <text
          x="26"
          y="16"
          textAnchor="middle"
          fill="#fbbf24"
          fontSize="8"
          fontWeight="bold"
        >
          FORCED
        </text>
        <text x="26" y="28" textAnchor="middle" fill="#e4e4e7" fontSize="7">
          Jump Captures
        </text>
      </g>

      <g transform="translate(290 90)">
        <rect
          width="52"
          height="38"
          rx="6"
          fill="#1c1917"
          stroke="#ef4444"
          strokeWidth="1"
          opacity="0.9"
        />
        <text
          x="26"
          y="16"
          textAnchor="middle"
          fill="#f87171"
          fontSize="8"
          fontWeight="bold"
        >
          KING
        </text>
        <text x="26" y="28" textAnchor="middle" fill="#e4e4e7" fontSize="7">
          Multi-Direction
        </text>
      </g>
    </svg>
  );
}

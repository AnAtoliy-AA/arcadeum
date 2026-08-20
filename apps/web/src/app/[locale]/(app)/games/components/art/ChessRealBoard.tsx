import React from 'react';

const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export function ChessRealBoard() {
  return (
    <svg
      viewBox="0 0 360 220"
      preserveAspectRatio="xMidYMid slice"
      className="w-full h-full select-none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="chess-board-glow" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
          <stop offset="60%" stopColor="#1e3a8a" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#080705" stopOpacity="0" />
        </radialGradient>
        <filter
          id="chess-piece-shadow"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="3"
            floodColor="#000000"
            floodOpacity="0.85"
          />
        </filter>
        <linearGradient id="chess-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#a16207" />
        </linearGradient>
      </defs>

      <rect width="360" height="220" fill="#0c0a09" />
      <rect width="360" height="220" fill="url(#chess-board-glow)" />

      {/* Real 8x8 Chessboard Container */}
      <g transform="translate(85 15)">
        {/* Wooden / Slate Border Frame */}
        <rect
          x="-10"
          y="-10"
          width="200"
          height="200"
          rx="8"
          fill="#1c1917"
          stroke="#44403c"
          strokeWidth="2"
        />

        {/* Board squares */}
        {RANKS.map((rank, r) =>
          FILES.map((file, c) => {
            const isLight = (r + c) % 2 === 0;
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
                fill={isLight ? '#e7e5e4' : '#57534e'}
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
            fill="#a8a29e"
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
            fill="#a8a29e"
            fontSize="7"
            fontFamily="sans-serif"
            fontWeight="bold"
          >
            {rank}
          </text>
        ))}

        {/* Move Highlight square */}
        <rect
          x={4 * 22.5}
          y={4 * 22.5}
          width="22.5"
          height="22.5"
          fill="#eab308"
          opacity="0.4"
        />
        <rect
          x={6 * 22.5}
          y={2 * 22.5}
          width="22.5"
          height="22.5"
          fill="#3b82f6"
          opacity="0.35"
        />

        {/* Real Chess Pieces on Board */}
        {/* Black Pieces (Top Ranks) */}
        <text
          x={0 * 22.5 + 11.25}
          y={0 * 22.5 + 17}
          textAnchor="middle"
          fill="#18181b"
          stroke="#ffffff"
          strokeWidth="0.3"
          fontSize="16"
          filter="url(#chess-piece-shadow)"
        >
          ♜
        </text>
        <text
          x={1 * 22.5 + 11.25}
          y={0 * 22.5 + 17}
          textAnchor="middle"
          fill="#18181b"
          stroke="#ffffff"
          strokeWidth="0.3"
          fontSize="16"
          filter="url(#chess-piece-shadow)"
        >
          ♞
        </text>
        <text
          x={2 * 22.5 + 11.25}
          y={0 * 22.5 + 17}
          textAnchor="middle"
          fill="#18181b"
          stroke="#ffffff"
          strokeWidth="0.3"
          fontSize="16"
          filter="url(#chess-piece-shadow)"
        >
          ♝
        </text>
        <text
          x={3 * 22.5 + 11.25}
          y={0 * 22.5 + 17}
          textAnchor="middle"
          fill="#18181b"
          stroke="#ffffff"
          strokeWidth="0.3"
          fontSize="16"
          filter="url(#chess-piece-shadow)"
        >
          ♛
        </text>
        <text
          x={4 * 22.5 + 11.25}
          y={0 * 22.5 + 17}
          textAnchor="middle"
          fill="#18181b"
          stroke="#ffffff"
          strokeWidth="0.3"
          fontSize="16"
          filter="url(#chess-piece-shadow)"
        >
          ♚
        </text>
        <text
          x={5 * 22.5 + 11.25}
          y={0 * 22.5 + 17}
          textAnchor="middle"
          fill="#18181b"
          stroke="#ffffff"
          strokeWidth="0.3"
          fontSize="16"
          filter="url(#chess-piece-shadow)"
        >
          ♝
        </text>
        <text
          x={7 * 22.5 + 11.25}
          y={0 * 22.5 + 17}
          textAnchor="middle"
          fill="#18181b"
          stroke="#ffffff"
          strokeWidth="0.3"
          fontSize="16"
          filter="url(#chess-piece-shadow)"
        >
          ♜
        </text>

        {/* Black Pawns */}
        <text
          x={0 * 22.5 + 11.25}
          y={1 * 22.5 + 17}
          textAnchor="middle"
          fill="#18181b"
          stroke="#ffffff"
          strokeWidth="0.3"
          fontSize="15"
          filter="url(#chess-piece-shadow)"
        >
          ♟
        </text>
        <text
          x={1 * 22.5 + 11.25}
          y={1 * 22.5 + 17}
          textAnchor="middle"
          fill="#18181b"
          stroke="#ffffff"
          strokeWidth="0.3"
          fontSize="15"
          filter="url(#chess-piece-shadow)"
        >
          ♟
        </text>
        <text
          x={2 * 22.5 + 11.25}
          y={1 * 22.5 + 17}
          textAnchor="middle"
          fill="#18181b"
          stroke="#ffffff"
          strokeWidth="0.3"
          fontSize="15"
          filter="url(#chess-piece-shadow)"
        >
          ♟
        </text>
        <text
          x={3 * 22.5 + 11.25}
          y={2 * 22.5 + 17}
          textAnchor="middle"
          fill="#18181b"
          stroke="#ffffff"
          strokeWidth="0.3"
          fontSize="15"
          filter="url(#chess-piece-shadow)"
        >
          ♟
        </text>
        <text
          x={5 * 22.5 + 11.25}
          y={1 * 22.5 + 17}
          textAnchor="middle"
          fill="#18181b"
          stroke="#ffffff"
          strokeWidth="0.3"
          fontSize="15"
          filter="url(#chess-piece-shadow)"
        >
          ♟
        </text>
        <text
          x={6 * 22.5 + 11.25}
          y={1 * 22.5 + 17}
          textAnchor="middle"
          fill="#18181b"
          stroke="#ffffff"
          strokeWidth="0.3"
          fontSize="15"
          filter="url(#chess-piece-shadow)"
        >
          ♟
        </text>
        <text
          x={7 * 22.5 + 11.25}
          y={1 * 22.5 + 17}
          textAnchor="middle"
          fill="#18181b"
          stroke="#ffffff"
          strokeWidth="0.3"
          fontSize="15"
          filter="url(#chess-piece-shadow)"
        >
          ♟
        </text>

        {/* Tactical White Pieces */}
        <text
          x={5 * 22.5 + 11.25}
          y={2 * 22.5 + 17}
          textAnchor="middle"
          fill="#ffffff"
          stroke="#18181b"
          strokeWidth="0.4"
          fontSize="16"
          filter="url(#chess-piece-shadow)"
        >
          ♘
        </text>
        <text
          x={4 * 22.5 + 11.25}
          y={4 * 22.5 + 17}
          textAnchor="middle"
          fill="#ffffff"
          stroke="#18181b"
          strokeWidth="0.4"
          fontSize="15"
          filter="url(#chess-piece-shadow)"
        >
          ♙
        </text>
        <text
          x={3 * 22.5 + 11.25}
          y={3 * 22.5 + 17}
          textAnchor="middle"
          fill="#ffffff"
          stroke="#18181b"
          strokeWidth="0.4"
          fontSize="15"
          filter="url(#chess-piece-shadow)"
        >
          ♙
        </text>

        {/* White Home Rank Pieces */}
        <text
          x={0 * 22.5 + 11.25}
          y={7 * 22.5 + 17}
          textAnchor="middle"
          fill="#ffffff"
          stroke="#18181b"
          strokeWidth="0.4"
          fontSize="16"
          filter="url(#chess-piece-shadow)"
        >
          ♖
        </text>
        <text
          x={1 * 22.5 + 11.25}
          y={7 * 22.5 + 17}
          textAnchor="middle"
          fill="#ffffff"
          stroke="#18181b"
          strokeWidth="0.4"
          fontSize="16"
          filter="url(#chess-piece-shadow)"
        >
          ♘
        </text>
        <text
          x={2 * 22.5 + 11.25}
          y={7 * 22.5 + 17}
          textAnchor="middle"
          fill="#ffffff"
          stroke="#18181b"
          strokeWidth="0.4"
          fontSize="16"
          filter="url(#chess-piece-shadow)"
        >
          ♗
        </text>
        <text
          x={3 * 22.5 + 11.25}
          y={7 * 22.5 + 17}
          textAnchor="middle"
          fill="#ffffff"
          stroke="#18181b"
          strokeWidth="0.4"
          fontSize="16"
          filter="url(#chess-piece-shadow)"
        >
          ♕
        </text>
        <text
          x={4 * 22.5 + 11.25}
          y={7 * 22.5 + 17}
          textAnchor="middle"
          fill="#ffffff"
          stroke="#18181b"
          strokeWidth="0.4"
          fontSize="16"
          filter="url(#chess-piece-shadow)"
        >
          ♔
        </text>
        <text
          x={5 * 22.5 + 11.25}
          y={7 * 22.5 + 17}
          textAnchor="middle"
          fill="#ffffff"
          stroke="#18181b"
          strokeWidth="0.4"
          fontSize="16"
          filter="url(#chess-piece-shadow)"
        >
          ♗
        </text>
        <text
          x={7 * 22.5 + 11.25}
          y={7 * 22.5 + 17}
          textAnchor="middle"
          fill="#ffffff"
          stroke="#18181b"
          strokeWidth="0.4"
          fontSize="16"
          filter="url(#chess-piece-shadow)"
        >
          ♖
        </text>
      </g>

      {/* Floating Tactical Badges */}
      <g transform="translate(18 90)">
        <rect
          width="52"
          height="38"
          rx="6"
          fill="#18181b"
          stroke="#3b82f6"
          strokeWidth="1"
          opacity="0.9"
        />
        <text
          x="26"
          y="16"
          textAnchor="middle"
          fill="#60a5fa"
          fontSize="8"
          fontWeight="bold"
        >
          ELO 1650
        </text>
        <text x="26" y="28" textAnchor="middle" fill="#e4e4e7" fontSize="7">
          1. e4 e5
        </text>
      </g>

      <g transform="translate(290 90)">
        <rect
          width="52"
          height="38"
          rx="6"
          fill="#18181b"
          stroke="#eab308"
          strokeWidth="1"
          opacity="0.9"
        />
        <text
          x="26"
          y="16"
          textAnchor="middle"
          fill="#facc15"
          fontSize="8"
          fontWeight="bold"
        >
          Tactic
        </text>
        <text x="26" y="28" textAnchor="middle" fill="#e4e4e7" fontSize="7">
          Nf3 +1.2
        </text>
      </g>
    </svg>
  );
}

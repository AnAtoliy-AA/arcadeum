import React from 'react';

interface FaceCardProps {
  rank: string;
  suit: '♠' | '♥' | '♦' | '♣';
  isRed?: boolean;
}

function FaceCard({ rank, suit, isRed }: FaceCardProps) {
  const color = isRed ? '#dc2626' : '#0f172a';
  return (
    <g filter="url(#sol-card-shadow)">
      <rect
        width="26"
        height="36"
        rx="3.5"
        fill="url(#sol-card-bg)"
        stroke="#cbd5e1"
        strokeWidth="0.8"
      />
      <text
        x="4"
        y="10"
        fill={color}
        fontSize="8"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        {rank}
      </text>
      <text x="4" y="18" fill={color} fontSize="7">
        {suit}
      </text>
      <text x="13" y="24" textAnchor="middle" fill={color} fontSize="13">
        {suit}
      </text>
    </g>
  );
}

function CardBack() {
  return (
    <g filter="url(#sol-card-shadow)">
      <rect
        width="26"
        height="36"
        rx="3.5"
        fill="url(#sol-back-bg)"
        stroke="#3b82f6"
        strokeWidth="0.8"
      />
      <rect
        x="3"
        y="3"
        width="20"
        height="30"
        rx="2"
        fill="none"
        stroke="#60a5fa"
        strokeWidth="0.6"
        strokeDasharray="2 1.5"
        opacity="0.6"
      />
    </g>
  );
}

export function SolitaireRealCards() {
  return (
    <svg
      viewBox="0 0 360 220"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full select-none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="sol-felt-glow" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#16a34a" stopOpacity="0.3" />
          <stop offset="60%" stopColor="#14532d" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#022c22" stopOpacity="0" />
        </radialGradient>
        <filter
          id="sol-card-shadow"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feDropShadow
            dx="0"
            dy="2.5"
            stdDeviation="2.5"
            floodColor="#000000"
            floodOpacity="0.85"
          />
        </filter>
        <linearGradient id="sol-card-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
        <linearGradient id="sol-back-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>

      <rect width="360" height="220" fill="#022c22" />
      <rect width="360" height="220" fill="url(#sol-felt-glow)" />

      <g transform="translate(68 16)">
        <CardBack />

        <g transform="translate(32 0)">
          <FaceCard rank="Q" suit="♥" isRed />
        </g>

        <g transform="translate(96 0)">
          <rect
            width="26"
            height="36"
            rx="3.5"
            fill="#064e3b"
            stroke="#10b981"
            strokeWidth="0.8"
            strokeDasharray="2 2"
            opacity="0.4"
          />
          <text
            x="13"
            y="22"
            textAnchor="middle"
            fill="#10b981"
            fontSize="12"
            opacity="0.5"
          >
            ♠
          </text>
        </g>

        <g transform="translate(128 0)">
          <FaceCard rank="A" suit="♠" />
        </g>

        <g transform="translate(160 0)">
          <FaceCard rank="A" suit="♥" isRed />
        </g>

        <g transform="translate(192 0)">
          <rect
            width="26"
            height="36"
            rx="3.5"
            fill="#064e3b"
            stroke="#10b981"
            strokeWidth="0.8"
            strokeDasharray="2 2"
            opacity="0.4"
          />
          <text
            x="13"
            y="22"
            textAnchor="middle"
            fill="#10b981"
            fontSize="12"
            opacity="0.5"
          >
            ♦
          </text>
        </g>

        <g transform="translate(0 48)">
          <FaceCard rank="8" suit="♣" />
        </g>

        <g transform="translate(36 48)">
          <CardBack />
          <g transform="translate(0 8)">
            <FaceCard rank="7" suit="♦" isRed />
          </g>
        </g>

        <g transform="translate(72 48)">
          <CardBack />
          <g transform="translate(0 7)">
            <CardBack />
          </g>
          <g transform="translate(0 14)">
            <FaceCard rank="6" suit="♠" />
          </g>
        </g>

        <g transform="translate(108 48)">
          <FaceCard rank="K" suit="♠" />
          <g transform="translate(0 10)">
            <FaceCard rank="Q" suit="♦" isRed />
          </g>
          <g transform="translate(0 20)">
            <FaceCard rank="J" suit="♣" />
          </g>
          <g transform="translate(0 30)">
            <FaceCard rank="10" suit="♥" isRed />
          </g>
        </g>

        <g transform="translate(144 48)">
          <CardBack />
          <g transform="translate(0 8)">
            <FaceCard rank="9" suit="♣" />
          </g>
        </g>

        <g transform="translate(180 48)">
          <CardBack />
          <g transform="translate(0 7)">
            <CardBack />
          </g>
          <g transform="translate(0 14)">
            <FaceCard rank="5" suit="♦" isRed />
          </g>
        </g>
      </g>

      <g transform="translate(12 90)">
        <rect
          width="48"
          height="36"
          rx="6"
          fill="#064e3b"
          stroke="#10b981"
          strokeWidth="1"
          opacity="0.9"
        />
        <text
          x="24"
          y="15"
          textAnchor="middle"
          fill="#34d399"
          fontSize="7.5"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          KLONDIKE
        </text>
        <text
          x="24"
          y="27"
          textAnchor="middle"
          fill="#d1fae5"
          fontSize="6.5"
          fontFamily="sans-serif"
        >
          Draw 1 or 3
        </text>
      </g>

      <g transform="translate(300 90)">
        <rect
          width="48"
          height="36"
          rx="6"
          fill="#064e3b"
          stroke="#10b981"
          strokeWidth="1"
          opacity="0.9"
        />
        <text
          x="24"
          y="15"
          textAnchor="middle"
          fill="#34d399"
          fontSize="7.5"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          7 STACKS
        </text>
        <text
          x="24"
          y="27"
          textAnchor="middle"
          fill="#d1fae5"
          fontSize="6.5"
          fontFamily="sans-serif"
        >
          Foundations
        </text>
      </g>
    </svg>
  );
}

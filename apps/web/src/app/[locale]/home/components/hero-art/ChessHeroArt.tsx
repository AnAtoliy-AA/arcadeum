import React from 'react';

export function ChessHeroArt() {
  return (
    <svg
      viewBox="0 0 280 380"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full select-none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="chess-hero-glow" cx="50%" cy="42%" r="65%">
          <stop offset="0%" stopColor="#eab308" stopOpacity="0.2" />
          <stop offset="60%" stopColor="#854d0e" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#080705" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="chess-board-persp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e1b18" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#0d0c0a" stopOpacity="0.98" />
        </linearGradient>
        <linearGradient id="chess-gold-crown" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
        <filter id="chess-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <rect width="280" height="380" fill="#0c0a09" />
      <rect width="280" height="380" fill="url(#chess-hero-glow)" />

      {/* 3D-angled tournament chessboard matrix */}
      <g transform="translate(140 250) scale(1, 0.45) rotate(45)">
        <rect
          x="-90"
          y="-90"
          width="180"
          height="180"
          fill="url(#chess-board-persp)"
          stroke="#44403c"
          strokeWidth="2"
        />
        {Array.from({ length: 6 }).map((_, r) =>
          Array.from({ length: 6 }).map((__, c) => {
            const isLight = (r + c) % 2 === 0;
            const size = 30;
            const x = -90 + c * size;
            const y = -90 + r * size;
            return (
              <rect
                key={`${r}-${c}`}
                x={x}
                y={y}
                width={size}
                height={size}
                fill={isLight ? '#d6d3d1' : '#292524'}
                opacity={isLight ? 0.35 : 0.8}
              />
            );
          }),
        )}
      </g>

      {/* Majestic Grandmaster Crowned King Silhouette */}
      <g transform="translate(140 160)">
        <circle
          cx="0"
          cy="-10"
          r="55"
          fill="#facc15"
          opacity="0.1"
          filter="url(#chess-glow)"
        />

        {/* Crown Cross */}
        <path
          d="M -3 -68 L 3 -68 L 3 -58 L -3 -58 Z M -8 -65 L 8 -65 L 8 -61 L -8 -61 Z"
          fill="url(#chess-gold-crown)"
        />
        {/* Crown top finial */}
        <path
          d="M -18 -48 Q 0 -58 18 -48 Q 14 -38 0 -36 Q -14 -38 -18 -48 Z"
          fill="url(#chess-gold-crown)"
        />
        {/* Head bulb */}
        <circle
          cx="0"
          cy="-30"
          r="15"
          fill="#fafaf9"
          stroke="#d6d3d1"
          strokeWidth="1"
        />
        {/* Neck collar */}
        <rect
          x="-14"
          y="-14"
          width="28"
          height="6"
          rx="2"
          fill="url(#chess-gold-crown)"
        />
        {/* Torso */}
        <path
          d="M -12 -8 Q -24 30 -30 45 L 30 45 Q 24 30 12 -8 Z"
          fill="#fafaf9"
        />
        <path d="M 0 -8 Q 12 30 30 45 L 0 45 Z" fill="#e7e5e4" opacity="0.75" />
        {/* Base */}
        <rect
          x="-35"
          y="45"
          width="70"
          height="9"
          rx="3"
          fill="url(#chess-gold-crown)"
        />
        <rect x="-42" y="54" width="84" height="12" rx="4" fill="#fafaf9" />
      </g>

      {/* Floating strategy indicators */}
      <text
        x="60"
        y="90"
        fill="#fef08a"
        opacity="0.6"
        fontSize="12"
        fontFamily="monospace"
        fontWeight="bold"
      >
        e4
      </text>
      <text
        x="215"
        y="105"
        fill="#fef08a"
        opacity="0.6"
        fontSize="12"
        fontFamily="monospace"
        fontWeight="bold"
      >
        Nf3
      </text>
      <text
        x="195"
        y="270"
        fill="#fef08a"
        opacity="0.4"
        fontSize="11"
        fontFamily="monospace"
      >
        #1500+
      </text>
    </svg>
  );
}

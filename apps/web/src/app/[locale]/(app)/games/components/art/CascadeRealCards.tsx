import React from 'react';

export function CascadeRealCards() {
  return (
    <svg
      viewBox="0 0 360 220"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full select-none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="casc-bg-glow" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.32" />
          <stop offset="60%" stopColor="#4c1d95" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#080312" stopOpacity="0" />
        </radialGradient>
        <filter id="casc-drop" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="6"
            stdDeviation="6"
            floodColor="#000000"
            floodOpacity="0.75"
          />
        </filter>
        <linearGradient id="casc-wild-wheel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="28%" stopColor="#f59e0b" />
          <stop offset="56%" stopColor="#10b981" />
          <stop offset="84%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>

      <rect width="360" height="220" fill="#090414" />
      <rect width="360" height="220" fill="url(#casc-bg-glow)" />

      {/* Energy aura rings */}
      <circle
        cx="180"
        cy="110"
        r="90"
        fill="none"
        stroke="#c084fc"
        strokeWidth="0.8"
        opacity="0.2"
        strokeDasharray="5 7"
      />

      {/* Card 1: Crimson +2 (Far Left) */}
      <g
        transform="translate(70 125) rotate(-22) translate(-36 -56)"
        filter="url(#casc-drop)"
      >
        <rect
          width="72"
          height="112"
          rx="10"
          fill="#dc2626"
          stroke="#fca5a5"
          strokeWidth="1.5"
        />
        <rect
          x="5"
          y="5"
          width="62"
          height="102"
          rx="7"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
        />
        <text
          x="12"
          y="24"
          fill="#ffffff"
          fontSize="16"
          fontWeight="900"
          fontFamily="sans-serif"
        >
          +2
        </text>
        <text
          x="36"
          y="65"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="30"
          fontWeight="900"
          fontFamily="sans-serif"
        >
          +2
        </text>
        <text
          x="60"
          y="98"
          textAnchor="end"
          fill="#ffffff"
          fontSize="13"
          fontWeight="900"
          fontFamily="sans-serif"
        >
          +2
        </text>
      </g>

      {/* Card 2: Emerald Skip (Mid Left) */}
      <g
        transform="translate(124 112) rotate(-11) translate(-36 -56)"
        filter="url(#casc-drop)"
      >
        <rect
          width="72"
          height="112"
          rx="10"
          fill="#059669"
          stroke="#6ee7b7"
          strokeWidth="1.5"
        />
        <rect
          x="5"
          y="5"
          width="62"
          height="102"
          rx="7"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
        />
        <text
          x="12"
          y="24"
          fill="#ffffff"
          fontSize="16"
          fontWeight="900"
          fontFamily="sans-serif"
        >
          ⊘
        </text>
        <circle
          cx="36"
          cy="56"
          r="20"
          fill="none"
          stroke="#ffffff"
          strokeWidth="4"
        />
        <line
          x1="22"
          y1="42"
          x2="50"
          y2="70"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <text
          x="60"
          y="98"
          textAnchor="end"
          fill="#ffffff"
          fontSize="14"
          fontWeight="900"
          fontFamily="sans-serif"
        >
          ⊘
        </text>
      </g>

      {/* Card 3: Rainbow Wild Supernova (Center) */}
      <g
        transform="translate(180 102) rotate(0) translate(-42 -64)"
        filter="url(#casc-drop)"
      >
        <rect
          width="84"
          height="128"
          rx="12"
          fill="#0f172a"
          stroke="#f472b6"
          strokeWidth="2"
        />
        <rect
          x="5"
          y="5"
          width="74"
          height="118"
          rx="9"
          fill="url(#casc-wild-wheel)"
          opacity="0.95"
        />
        <circle cx="42" cy="64" r="22" fill="#0f172a" />
        <path d="M 42 64 L 42 44 A 20 20 0 0 1 62 64 Z" fill="#ef4444" />
        <path d="M 42 64 L 62 64 A 20 20 0 0 1 42 84 Z" fill="#3b82f6" />
        <path d="M 42 64 L 42 84 A 20 20 0 0 1 22 64 Z" fill="#eab308" />
        <path d="M 42 64 L 22 64 A 20 20 0 0 1 42 44 Z" fill="#10b981" />
        <text
          x="42"
          y="69"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="13"
          fontWeight="900"
          fontFamily="sans-serif"
        >
          W
        </text>
        <text
          x="12"
          y="22"
          fill="#ffffff"
          fontSize="13"
          fontWeight="900"
          fontFamily="sans-serif"
        >
          ★
        </text>
        <text
          x="72"
          y="116"
          textAnchor="end"
          fill="#ffffff"
          fontSize="13"
          fontWeight="900"
          fontFamily="sans-serif"
        >
          ★
        </text>
      </g>

      {/* Card 4: Azure Reverse (Mid Right) */}
      <g
        transform="translate(236 112) rotate(11) translate(-36 -56)"
        filter="url(#casc-drop)"
      >
        <rect
          width="72"
          height="112"
          rx="10"
          fill="#2563eb"
          stroke="#93c5fd"
          strokeWidth="1.5"
        />
        <rect
          x="5"
          y="5"
          width="62"
          height="102"
          rx="7"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
        />
        <text
          x="12"
          y="24"
          fill="#ffffff"
          fontSize="16"
          fontWeight="900"
          fontFamily="sans-serif"
        >
          ↻
        </text>
        <text
          x="36"
          y="68"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="34"
          fontWeight="900"
          fontFamily="sans-serif"
        >
          ↻
        </text>
        <text
          x="60"
          y="98"
          textAnchor="end"
          fill="#ffffff"
          fontSize="14"
          fontWeight="900"
          fontFamily="sans-serif"
        >
          ↻
        </text>
      </g>

      {/* Card 5: Amber 7 (Far Right) */}
      <g
        transform="translate(290 125) rotate(22) translate(-36 -56)"
        filter="url(#casc-drop)"
      >
        <rect
          width="72"
          height="112"
          rx="10"
          fill="#d97706"
          stroke="#fde68a"
          strokeWidth="1.5"
        />
        <rect
          x="5"
          y="5"
          width="62"
          height="102"
          rx="7"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
        />
        <text
          x="12"
          y="24"
          fill="#ffffff"
          fontSize="16"
          fontWeight="900"
          fontFamily="sans-serif"
        >
          7
        </text>
        <text
          x="36"
          y="68"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="34"
          fontWeight="900"
          fontFamily="sans-serif"
        >
          7
        </text>
        <text
          x="60"
          y="98"
          textAnchor="end"
          fill="#ffffff"
          fontSize="14"
          fontWeight="900"
          fontFamily="sans-serif"
        >
          7
        </text>
      </g>
    </svg>
  );
}

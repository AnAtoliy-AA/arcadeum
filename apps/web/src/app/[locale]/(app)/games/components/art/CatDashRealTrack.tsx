import React from 'react';

export function CatDashRealTrack() {
  return (
    <svg
      viewBox="0 0 360 220"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full select-none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="cat-bg-glow" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.28" />
          <stop offset="60%" stopColor="#6d28d9" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#080312" stopOpacity="0" />
        </radialGradient>
        <filter id="cat-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="4"
            stdDeviation="4"
            floodColor="#000000"
            floodOpacity="0.8"
          />
        </filter>
        <linearGradient id="cat-dice-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
      </defs>

      <rect width="360" height="220" fill="#090414" />
      <rect width="360" height="220" fill="url(#cat-bg-glow)" />

      {/* Real S-Curved Race Track */}
      <path
        d="M 30 150 C 90 150 100 80 180 80 C 260 80 270 140 330 140"
        fill="none"
        stroke="#334155"
        strokeWidth="28"
        strokeLinecap="round"
      />
      <path
        d="M 30 150 C 90 150 100 80 180 80 C 260 80 270 140 330 140"
        fill="none"
        stroke="#1e293b"
        strokeWidth="22"
        strokeLinecap="round"
      />
      <path
        d="M 30 150 C 90 150 100 80 180 80 C 260 80 270 140 330 140"
        fill="none"
        stroke="#8b5cf6"
        strokeWidth="2"
        strokeDasharray="4 6"
        opacity="0.8"
      />

      {/* Track Milestone Nodes */}
      <circle
        cx="50"
        cy="150"
        r="7"
        fill="#3b82f6"
        stroke="#93c5fd"
        strokeWidth="1.5"
      />
      <text
        x="50"
        y="153"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="8"
        fontWeight="bold"
      >
        1
      </text>

      <circle
        cx="105"
        cy="115"
        r="7"
        fill="#10b981"
        stroke="#6ee7b7"
        strokeWidth="1.5"
      />
      <text
        x="105"
        y="118"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="8"
        fontWeight="bold"
      >
        2
      </text>

      <circle
        cx="180"
        cy="80"
        r="8"
        fill="#f59e0b"
        stroke="#fde68a"
        strokeWidth="1.5"
      />
      <text
        x="180"
        y="83"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="8"
        fontWeight="bold"
      >
        3
      </text>

      <circle
        cx="255"
        cy="115"
        r="7"
        fill="#ec4899"
        stroke="#fbcfe8"
        strokeWidth="1.5"
      />
      <text
        x="255"
        y="118"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="8"
        fontWeight="bold"
      >
        4
      </text>

      <circle
        cx="310"
        cy="140"
        r="9"
        fill="#ef4444"
        stroke="#fecaca"
        strokeWidth="2"
      />
      <text x="310" y="144" textAnchor="middle" fill="#ffffff" fontSize="10">
        🏁
      </text>

      {/* Racing Cat Token 1 (Orange Lead Cat) */}
      <g transform="translate(180 52)" filter="url(#cat-shadow)">
        <circle
          cx="0"
          cy="0"
          r="15"
          fill="#f97316"
          stroke="#fed7aa"
          strokeWidth="2"
        />
        <text x="0" y="6" textAnchor="middle" fontSize="18">
          🐱
        </text>
        <rect x="-8" y="17" width="16" height="7" rx="3.5" fill="#f97316" />
        <text
          x="0"
          y="23"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="5.5"
          fontWeight="bold"
        >
          1st
        </text>
      </g>

      {/* Racing Cat Token 2 (Purple Chaser Cat) */}
      <g transform="translate(105 87)" filter="url(#cat-shadow)">
        <circle
          cx="0"
          cy="0"
          r="13"
          fill="#8b5cf6"
          stroke="#ddd6fe"
          strokeWidth="1.5"
        />
        <text x="0" y="5" textAnchor="middle" fontSize="15">
          😼
        </text>
      </g>

      {/* 3D Dice Roller */}
      <g transform="translate(265 42) rotate(12)" filter="url(#cat-shadow)">
        <rect
          width="36"
          height="36"
          rx="8"
          fill="url(#cat-dice-grad)"
          stroke="#94a3b8"
          strokeWidth="1.5"
        />
        {/* 6 Pips on Top Face */}
        <circle cx="10" cy="10" r="3" fill="#0f172a" />
        <circle cx="10" cy="18" r="3" fill="#0f172a" />
        <circle cx="10" cy="26" r="3" fill="#0f172a" />
        <circle cx="26" cy="10" r="3" fill="#0f172a" />
        <circle cx="26" cy="18" r="3" fill="#0f172a" />
        <circle cx="26" cy="26" r="3" fill="#0f172a" />
      </g>

      {/* Floating Badges */}
      <g transform="translate(18 18)">
        <rect
          width="52"
          height="32"
          rx="6"
          fill="#18181b"
          stroke="#f97316"
          strokeWidth="1"
          opacity="0.9"
        />
        <text
          x="26"
          y="14"
          textAnchor="middle"
          fill="#fb923c"
          fontSize="8"
          fontWeight="bold"
        >
          RACING
        </text>
        <text x="26" y="24" textAnchor="middle" fill="#e2e8f0" fontSize="6.5">
          Dice Battle
        </text>
      </g>

      <g transform="translate(290 170)">
        <rect
          width="52"
          height="32"
          rx="6"
          fill="#18181b"
          stroke="#8b5cf6"
          strokeWidth="1"
          opacity="0.9"
        />
        <text
          x="26"
          y="14"
          textAnchor="middle"
          fill="#a78bfa"
          fontSize="8"
          fontWeight="bold"
        >
          BOOST
        </text>
        <text x="26" y="24" textAnchor="middle" fill="#e2e8f0" fontSize="6.5">
          Cat Powers
        </text>
      </g>
    </svg>
  );
}

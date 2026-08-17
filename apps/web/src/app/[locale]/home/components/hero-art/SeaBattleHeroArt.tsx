import React from 'react';

export function SeaBattleHeroArt() {
  return (
    <svg
      viewBox="0 0 280 380"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full select-none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="sb-hero-glow" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
          <stop offset="60%" stopColor="#0369a1" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#050c18" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sb-hull" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.9" />
        </linearGradient>
        <filter id="sb-radar-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <rect width="280" height="380" fill="#070f1e" />
      <rect width="280" height="380" fill="url(#sb-hero-glow)" />

      {/* Tactical Radar Grid */}
      <g stroke="#0369a1" strokeWidth="0.75" opacity="0.35">
        <line x1="20" y1="50" x2="260" y2="50" />
        <line x1="20" y1="90" x2="260" y2="90" />
        <line x1="20" y1="130" x2="260" y2="130" />
        <line x1="20" y1="170" x2="260" y2="170" />
        <line x1="20" y1="210" x2="260" y2="210" />
        <line x1="20" y1="250" x2="260" y2="250" />
        <line x1="20" y1="290" x2="260" y2="290" />
        <line x1="20" y1="330" x2="260" y2="330" />

        <line x1="50" y1="30" x2="50" y2="350" />
        <line x1="90" y1="30" x2="90" y2="350" />
        <line x1="130" y1="30" x2="130" y2="350" />
        <line x1="170" y1="30" x2="170" y2="350" />
        <line x1="210" y1="30" x2="210" y2="350" />
        <line x1="250" y1="30" x2="250" y2="350" />
      </g>

      {/* Radar sweep rings */}
      <circle
        cx="140"
        cy="190"
        r="100"
        fill="none"
        stroke="#38bdf8"
        strokeWidth="1"
        opacity="0.2"
      />
      <circle
        cx="140"
        cy="190"
        r="60"
        fill="none"
        stroke="#38bdf8"
        strokeWidth="1"
        opacity="0.3"
        strokeDasharray="3 4"
      />
      <circle
        cx="140"
        cy="190"
        r="25"
        fill="none"
        stroke="#38bdf8"
        strokeWidth="1.2"
        opacity="0.4"
      />

      {/* Battleship Cruiser silhouette */}
      <g transform="translate(140 190) rotate(-25)">
        <path
          d="M -70 0 Q -50 -18 30 -14 Q 75 -6 85 0 Q 75 6 30 14 Q -50 18 -70 0 Z"
          fill="url(#sb-hull)"
          filter="url(#sb-radar-glow)"
        />
        <rect
          x="-30"
          y="-8"
          width="45"
          height="16"
          rx="3"
          fill="#e0f2fe"
          opacity="0.9"
        />
        <circle cx="-15" cy="0" r="6" fill="#0369a1" />
        <line
          x1="-15"
          y1="0"
          x2="5"
          y2="0"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="10" cy="0" r="5" fill="#0369a1" />
        <line
          x1="10"
          y1="0"
          x2="28"
          y2="0"
          stroke="#38bdf8"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>

      {/* Direct hit salvos & sonar pulses */}
      <circle
        cx="190"
        cy="140"
        r="8"
        fill="#ef4444"
        opacity="0.85"
        filter="url(#sb-radar-glow)"
      />
      <circle
        cx="190"
        cy="140"
        r="14"
        fill="none"
        stroke="#ef4444"
        strokeWidth="1.5"
        opacity="0.5"
      />
      <circle cx="90" cy="245" r="4" fill="#38bdf8" opacity="0.75" />
      <circle cx="210" cy="270" r="3" fill="#64748b" opacity="0.6" />
      <circle cx="65" cy="115" r="3" fill="#64748b" opacity="0.6" />

      {/* Target Crosshair */}
      <g
        transform="translate(190 140)"
        stroke="#ef4444"
        strokeWidth="1.4"
        opacity="0.8"
      >
        <line x1="-14" y1="0" x2="-4" y2="0" />
        <line x1="4" y1="0" x2="14" y2="0" />
        <line y1="-14" y2="-4" x1="0" x2="0" />
        <line y1="4" y2="14" x1="0" x2="0" />
      </g>
    </svg>
  );
}

import React from 'react';

export function CascadeHeroArt() {
  return (
    <svg
      viewBox="0 0 280 380"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full select-none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="casc-hero-glow" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.25" />
          <stop offset="60%" stopColor="#6b21a8" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#080312" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="casc-wild-rainbow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="28%" stopColor="#f59e0b" />
          <stop offset="56%" stopColor="#10b981" />
          <stop offset="84%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <filter id="casc-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <rect width="280" height="380" fill="#090414" />
      <rect width="280" height="380" fill="url(#casc-hero-glow)" />

      {/* Action Burst Energy Rings */}
      <circle
        cx="140"
        cy="185"
        r="95"
        fill="none"
        stroke="#c084fc"
        strokeWidth="1"
        opacity="0.25"
        strokeDasharray="6 8"
      />
      <circle
        cx="140"
        cy="185"
        r="125"
        fill="none"
        stroke="#e879f9"
        strokeWidth="0.8"
        opacity="0.15"
      />

      {/* Fan of 3 vibrant Cascade Cards */}
      {/* Left Card: Crimson Draw +2 */}
      <g transform="translate(100 195) rotate(-18) translate(-42 -64)">
        <rect
          width="84"
          height="128"
          rx="12"
          fill="#dc2626"
          stroke="#fca5a5"
          strokeWidth="1.8"
          filter="url(#casc-glow)"
          opacity="0.85"
        />
        <rect
          x="6"
          y="6"
          width="72"
          height="116"
          rx="8"
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1"
        />
        <text
          x="14"
          y="26"
          fill="#ffffff"
          fontSize="16"
          fontWeight="900"
          fontFamily="sans-serif"
        >
          +2
        </text>
        <text
          x="42"
          y="74"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="32"
          fontWeight="900"
          fontFamily="sans-serif"
        >
          +2
        </text>
      </g>

      {/* Right Card: Azure Reverse / Skip */}
      <g transform="translate(180 195) rotate(18) translate(-42 -64)">
        <rect
          width="84"
          height="128"
          rx="12"
          fill="#2563eb"
          stroke="#93c5fd"
          strokeWidth="1.8"
          filter="url(#casc-glow)"
          opacity="0.85"
        />
        <rect
          x="6"
          y="6"
          width="72"
          height="116"
          rx="8"
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1"
        />
        <text
          x="14"
          y="26"
          fill="#ffffff"
          fontSize="16"
          fontWeight="900"
          fontFamily="sans-serif"
        >
          ↻
        </text>
        <text
          x="42"
          y="76"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="36"
          fontWeight="900"
          fontFamily="sans-serif"
        >
          ↻
        </text>
      </g>

      {/* Center Card: Glowing Rainbow Wild Supernova */}
      <g transform="translate(140 180) translate(-46 -70)">
        <rect
          width="92"
          height="140"
          rx="14"
          fill="#0f172a"
          stroke="#f472b6"
          strokeWidth="2.2"
          filter="url(#casc-glow)"
        />
        <rect
          x="6"
          y="6"
          width="80"
          height="128"
          rx="10"
          fill="url(#casc-wild-rainbow)"
          opacity="0.92"
        />
        <circle cx="46" cy="70" r="24" fill="#0f172a" />
        <path d="M 46 70 L 46 48 A 22 22 0 0 1 68 70 Z" fill="#ef4444" />
        <path d="M 46 70 L 68 70 A 22 22 0 0 1 46 92 Z" fill="#3b82f6" />
        <path d="M 46 70 L 46 92 A 22 22 0 0 1 24 70 Z" fill="#eab308" />
        <path d="M 46 70 L 24 70 A 22 22 0 0 1 46 48 Z" fill="#10b981" />
        <text
          x="46"
          y="75"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="13"
          fontWeight="900"
          fontFamily="sans-serif"
        >
          W
        </text>
        <text
          x="14"
          y="26"
          fill="#ffffff"
          fontSize="15"
          fontWeight="900"
          fontFamily="sans-serif"
        >
          ★
        </text>
        <text
          x="78"
          y="126"
          textAnchor="end"
          fill="#ffffff"
          fontSize="15"
          fontWeight="900"
          fontFamily="sans-serif"
        >
          ★
        </text>
      </g>

      {/* Dynamic Action Sparks */}
      <circle cx="70" cy="110" r="2.5" fill="#f43f5e" />
      <circle cx="210" cy="115" r="2.5" fill="#38bdf8" />
      <circle cx="225" cy="270" r="3" fill="#facc15" />
      <circle cx="55" cy="265" r="2" fill="#a855f7" />
    </svg>
  );
}

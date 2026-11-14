import React from 'react';

export function ArcadePetRealPreview() {
  return (
    <svg
      viewBox="0 0 360 220"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full select-none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="pet-preview-glow" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
          <stop offset="60%" stopColor="#047857" stopOpacity="0.09" />
          <stop offset="100%" stopColor="#022c22" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pet-device-shell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#be185d" />
        </linearGradient>
        <linearGradient id="pet-lcd-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9ebd7b" />
          <stop offset="100%" stopColor="#8ba869" />
        </linearGradient>
      </defs>

      <rect width="360" height="220" fill="#04130c" />
      <rect width="360" height="220" fill="url(#pet-preview-glow)" />

      <ellipse
        cx="180"
        cy="115"
        rx="72"
        ry="86"
        fill="url(#pet-device-shell)"
        stroke="#fda4af"
        strokeWidth="2.5"
      />
      <ellipse
        cx="180"
        cy="115"
        rx="66"
        ry="79"
        fill="none"
        stroke="#831843"
        strokeWidth="1.5"
        opacity="0.6"
      />

      <rect
        x="135"
        y="65"
        width="90"
        height="74"
        rx="8"
        fill="#1e293b"
        stroke="#0f172a"
        strokeWidth="2"
      />
      <rect
        x="141"
        y="71"
        width="78"
        height="62"
        rx="4"
        fill="url(#pet-lcd-bg)"
        stroke="#708752"
        strokeWidth="1"
      />

      <g fill="#24381e" opacity="0.4" fontSize="7" fontFamily="monospace">
        <text x="145" y="80">
          MEAL
        </text>
        <text x="170" y="80">
          PLAY
        </text>
        <text x="195" y="80">
          CLEAN
        </text>
      </g>

      <g fill="#1f331b">
        <rect x="170" y="88" width="20" height="18" rx="3" />
        <rect x="167" y="93" width="4" height="7" rx="2" />
        <rect x="189" y="93" width="4" height="7" rx="2" />
        <circle cx="175" cy="95" r="1.6" fill="#8ba869" />
        <circle cx="185" cy="95" r="1.6" fill="#8ba869" />
        <path
          d="M 177 101 Q 180 103 183 101"
          stroke="#8ba869"
          strokeWidth="1"
          fill="none"
        />
        <rect x="172" y="106" width="5" height="5" rx="1" />
        <rect x="183" y="106" width="5" height="5" rx="1" />
      </g>

      <path
        d="M 200 118 Q 204 114 207 118 Q 205 124 200 124 Z"
        fill="#4d5c31"
        opacity="0.8"
      />

      <circle
        cx="152"
        cy="162"
        r="8"
        fill="#facc15"
        stroke="#ca8a04"
        strokeWidth="1.5"
      />
      <circle
        cx="180"
        cy="167"
        r="8"
        fill="#38bdf8"
        stroke="#0284c7"
        strokeWidth="1.5"
      />
      <circle
        cx="208"
        cy="162"
        r="8"
        fill="#f43f5e"
        stroke="#e11d48"
        strokeWidth="1.5"
      />

      <circle
        cx="180"
        cy="22"
        r="5"
        fill="none"
        stroke="#94a3b8"
        strokeWidth="2"
      />
    </svg>
  );
}

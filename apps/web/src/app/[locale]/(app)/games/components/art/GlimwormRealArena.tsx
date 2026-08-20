import React from 'react';

export function GlimwormRealArena() {
  return (
    <svg
      viewBox="0 0 360 220"
      preserveAspectRatio="xMidYMid slice"
      className="w-full h-full select-none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="gw-bg-glow" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
          <stop offset="60%" stopColor="#6b21a8" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#05010a" stopOpacity="0" />
        </radialGradient>
        <filter id="gw-neon-green" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="gw-neon-pink" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="gw-neon-cyan" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <rect width="360" height="220" fill="#06010a" />
      <rect width="360" height="220" fill="url(#gw-bg-glow)" />

      {/* Grid Boundary Arena Lines */}
      <rect
        x="25"
        y="15"
        width="310"
        height="190"
        rx="14"
        fill="none"
        stroke="#1e1b4b"
        strokeWidth="1.5"
      />
      <circle
        cx="180"
        cy="110"
        r="70"
        fill="none"
        stroke="#312e81"
        strokeWidth="0.8"
        strokeDasharray="4 6"
      />

      {/* Star Particles */}
      {[
        [45, 35],
        [90, 80],
        [140, 40],
        [220, 30],
        [280, 75],
        [320, 45],
        [60, 175],
        [110, 140],
        [250, 180],
        [300, 160],
        [180, 195],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="1" fill="#ffffff" opacity="0.4" />
      ))}

      {/* Glowing Food / Energy Orbs */}
      <circle
        cx="95"
        cy="55"
        r="4"
        fill="#facc15"
        filter="url(#gw-neon-pink)"
      />
      <circle
        cx="265"
        cy="65"
        r="4"
        fill="#38bdf8"
        filter="url(#gw-neon-cyan)"
      />
      <circle
        cx="175"
        cy="110"
        r="5"
        fill="#f43f5e"
        filter="url(#gw-neon-pink)"
      />
      <circle
        cx="120"
        cy="165"
        r="4"
        fill="#4ade80"
        filter="url(#gw-neon-green)"
      />
      <circle
        cx="280"
        cy="145"
        r="4.5"
        fill="#facc15"
        filter="url(#gw-neon-pink)"
      />

      {/* Cyan Snake Trail */}
      <path
        d="M 45 60 Q 110 30 160 85 T 270 100"
        fill="none"
        stroke="#06b6d4"
        strokeWidth="6"
        strokeLinecap="round"
        filter="url(#gw-neon-cyan)"
        opacity="0.9"
      />
      <circle
        cx="270"
        cy="100"
        r="7.5"
        fill="#22d3ee"
        filter="url(#gw-neon-cyan)"
      />
      <circle cx="272" cy="98" r="2" fill="#ffffff" />

      {/* Pink Snake Trail */}
      <path
        d="M 50 170 Q 120 195 180 140 T 305 155"
        fill="none"
        stroke="#ec4899"
        strokeWidth="6"
        strokeLinecap="round"
        filter="url(#gw-neon-pink)"
        opacity="0.9"
      />
      <circle
        cx="305"
        cy="155"
        r="7.5"
        fill="#f472b6"
        filter="url(#gw-neon-pink)"
      />
      <circle cx="307" cy="153" r="2" fill="#ffffff" />

      {/* Green Snake Trail */}
      <path
        d="M 70 120 Q 130 70 190 120 T 310 80"
        fill="none"
        stroke="#22c55e"
        strokeWidth="7"
        strokeLinecap="round"
        filter="url(#gw-neon-green)"
        opacity="0.95"
      />
      <circle
        cx="310"
        cy="80"
        r="8.5"
        fill="#4ade80"
        filter="url(#gw-neon-green)"
      />
      <circle cx="313" cy="78" r="2.5" fill="#ffffff" />

      {/* Floating Badges */}
      <g transform="translate(18 18)">
        <rect
          width="52"
          height="32"
          rx="6"
          fill="#0f051d"
          stroke="#22c55e"
          strokeWidth="1"
          opacity="0.9"
        />
        <text
          x="26"
          y="14"
          textAnchor="middle"
          fill="#4ade80"
          fontSize="8"
          fontWeight="bold"
        >
          SURVIVE
        </text>
        <text x="26" y="24" textAnchor="middle" fill="#e2e8f0" fontSize="6.5">
          2-10 Snakes
        </text>
      </g>

      <g transform="translate(290 170)">
        <rect
          width="52"
          height="32"
          rx="6"
          fill="#0f051d"
          stroke="#ec4899"
          strokeWidth="1"
          opacity="0.9"
        />
        <text
          x="26"
          y="14"
          textAnchor="middle"
          fill="#f472b6"
          fontSize="8"
          fontWeight="bold"
        >
          BOOST
        </text>
        <text x="26" y="24" textAnchor="middle" fill="#e2e8f0" fontSize="6.5">
          Speed Orbs
        </text>
      </g>
    </svg>
  );
}

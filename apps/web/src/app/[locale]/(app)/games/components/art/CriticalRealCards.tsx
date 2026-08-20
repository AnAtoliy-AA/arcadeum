import React from 'react';

export function CriticalRealCards() {
  return (
    <svg
      viewBox="0 0 360 220"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full select-none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="crit-glow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.28" />
          <stop offset="60%" stopColor="#ea580c" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#0b0612" stopOpacity="0" />
        </radialGradient>
        <filter
          id="crit-card-shadow"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feDropShadow
            dx="0"
            dy="6"
            stdDeviation="6"
            floodColor="#000000"
            floodOpacity="0.7"
          />
        </filter>
        <linearGradient id="crit-trap-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.98" />
        </linearGradient>
        <linearGradient id="crit-defuse-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#064e3b" stopOpacity="0.98" />
        </linearGradient>
        <linearGradient id="crit-recon-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.98" />
        </linearGradient>
        <linearGradient id="crit-attack-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#78350f" stopOpacity="0.98" />
        </linearGradient>
      </defs>

      <rect width="360" height="220" fill="#090511" />
      <rect width="360" height="220" fill="url(#crit-glow)" />

      <circle
        cx="180"
        cy="110"
        r="85"
        fill="none"
        stroke="#f97316"
        strokeWidth="0.8"
        opacity="0.2"
        strokeDasharray="4 6"
      />

      {/* Card 1: Attack (Far Left) */}
      <g
        transform="translate(68 122) rotate(-22) translate(-38 -58)"
        filter="url(#crit-card-shadow)"
      >
        <rect
          width="76"
          height="116"
          rx="8"
          fill="url(#crit-attack-grad)"
          stroke="#fcd34d"
          strokeWidth="1.2"
        />
        <rect
          x="5"
          y="5"
          width="66"
          height="106"
          rx="5"
          fill="#18181b"
          opacity="0.9"
        />
        <text
          x="10"
          y="18"
          fill="#f59e0b"
          fontSize="8"
          fontWeight="bold"
          fontFamily="monospace"
        >
          ⚔️ ATK
        </text>
        <circle cx="38" cy="54" r="18" fill="#f59e0b" opacity="0.15" />
        <text x="38" y="60" textAnchor="middle" fill="#fbbf24" fontSize="22">
          ⚡
        </text>
        <text
          x="38"
          y="86"
          textAnchor="middle"
          fill="#e4e4e7"
          fontSize="7"
          fontWeight="bold"
        >
          STRIKE ×2
        </text>
        <text x="38" y="96" textAnchor="middle" fill="#a1a1aa" fontSize="5.5">
          Force next turn
        </text>
      </g>

      {/* Card 2: Recon / Future Vision (Mid Left) */}
      <g
        transform="translate(122 110) rotate(-11) translate(-38 -58)"
        filter="url(#crit-card-shadow)"
      >
        <rect
          width="76"
          height="116"
          rx="8"
          fill="url(#crit-recon-grad)"
          stroke="#93c5fd"
          strokeWidth="1.2"
        />
        <rect
          x="5"
          y="5"
          width="66"
          height="106"
          rx="5"
          fill="#18181b"
          opacity="0.9"
        />
        <text
          x="10"
          y="18"
          fill="#60a5fa"
          fontSize="8"
          fontWeight="bold"
          fontFamily="monospace"
        >
          👁️ SCAN
        </text>
        <circle cx="38" cy="54" r="18" fill="#3b82f6" opacity="0.15" />
        <text x="38" y="60" textAnchor="middle" fill="#93c5fd" fontSize="22">
          🔮
        </text>
        <text
          x="38"
          y="86"
          textAnchor="middle"
          fill="#e4e4e7"
          fontSize="7"
          fontWeight="bold"
        >
          SEE FUTURE
        </text>
        <text x="38" y="96" textAnchor="middle" fill="#a1a1aa" fontSize="5.5">
          Top 3 cards
        </text>
      </g>

      {/* Card 3: Defuse / Neutralizer (Center) */}
      <g
        transform="translate(180 102) rotate(0) translate(-42 -64)"
        filter="url(#crit-card-shadow)"
      >
        <rect
          width="84"
          height="128"
          rx="10"
          fill="url(#crit-defuse-grad)"
          stroke="#6ee7b7"
          strokeWidth="1.8"
        />
        <rect
          x="6"
          y="6"
          width="72"
          height="116"
          rx="7"
          fill="#0f172a"
          opacity="0.95"
        />
        <text
          x="12"
          y="20"
          fill="#34d399"
          fontSize="9"
          fontWeight="bold"
          fontFamily="monospace"
        >
          🛡️ DEFUSE
        </text>
        <text
          x="72"
          y="20"
          textAnchor="end"
          fill="#34d399"
          fontSize="9"
          fontWeight="bold"
          fontFamily="monospace"
        >
          SAFE
        </text>
        <circle cx="42" cy="60" r="22" fill="#10b981" opacity="0.2" />
        <text x="42" y="68" textAnchor="middle" fill="#6ee7b7" fontSize="28">
          🔧
        </text>
        <text
          x="42"
          y="96"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="8.5"
          fontWeight="bold"
        >
          NEUTRALIZER
        </text>
        <text x="42" y="108" textAnchor="middle" fill="#94a3b8" fontSize="6.5">
          Disarms Trap Card
        </text>
      </g>

      {/* Card 4: Trap / Critical Overload (Mid Right) */}
      <g
        transform="translate(238 110) rotate(11) translate(-38 -58)"
        filter="url(#crit-card-shadow)"
      >
        <rect
          width="76"
          height="116"
          rx="8"
          fill="url(#crit-trap-grad)"
          stroke="#fca5a5"
          strokeWidth="1.5"
        />
        <rect
          x="5"
          y="5"
          width="66"
          height="106"
          rx="5"
          fill="#1c0a0e"
          opacity="0.92"
        />
        <text
          x="10"
          y="18"
          fill="#ef4444"
          fontSize="8"
          fontWeight="bold"
          fontFamily="monospace"
        >
          ⚠️ TRAP
        </text>
        <circle cx="38" cy="54" r="18" fill="#ef4444" opacity="0.25" />
        <text x="38" y="61" textAnchor="middle" fill="#f87171" fontSize="22">
          💥
        </text>
        <text
          x="38"
          y="86"
          textAnchor="middle"
          fill="#fecaca"
          fontSize="7"
          fontWeight="bold"
        >
          CRITICAL
        </text>
        <text x="38" y="96" textAnchor="middle" fill="#f87171" fontSize="5.5">
          Defuse or ELIM
        </text>
      </g>

      {/* Card 5: Shuffle (Far Right) */}
      <g
        transform="translate(292 122) rotate(22) translate(-38 -58)"
        filter="url(#crit-card-shadow)"
      >
        <rect
          width="76"
          height="116"
          rx="8"
          fill="#8b5cf6"
          stroke="#c4b5fd"
          strokeWidth="1.2"
        />
        <rect
          x="5"
          y="5"
          width="66"
          height="106"
          rx="5"
          fill="#18181b"
          opacity="0.9"
        />
        <text
          x="10"
          y="18"
          fill="#a78bfa"
          fontSize="8"
          fontWeight="bold"
          fontFamily="monospace"
        >
          🔀 MIX
        </text>
        <circle cx="38" cy="54" r="18" fill="#8b5cf6" opacity="0.15" />
        <text x="38" y="61" textAnchor="middle" fill="#c4b5fd" fontSize="22">
          🌀
        </text>
        <text
          x="38"
          y="86"
          textAnchor="middle"
          fill="#e4e4e7"
          fontSize="7"
          fontWeight="bold"
        >
          SHUFFLE
        </text>
        <text x="38" y="96" textAnchor="middle" fill="#a1a1aa" fontSize="5.5">
          Reset deck order
        </text>
      </g>
    </svg>
  );
}

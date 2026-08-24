import React from 'react';

export function PachisiRealBoard() {
  return (
    <svg
      viewBox="0 0 360 220"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full select-none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="pch-glow" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
          <stop offset="60%" stopColor="#b45309" stopOpacity="0.07" />
          <stop offset="100%" stopColor="#0d0702" stopOpacity="0" />
        </radialGradient>
        <filter id="pch-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="2.5"
            stdDeviation="2.5"
            floodColor="#000000"
            floodOpacity="0.8"
          />
        </filter>
        <linearGradient id="pch-pawn-red" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        <linearGradient id="pch-pawn-yellow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
        <linearGradient id="pch-pawn-green" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <linearGradient id="pch-pawn-blue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>

      <rect width="360" height="220" fill="#0d0702" />
      <rect width="360" height="220" fill="url(#pch-glow)" />

      <g transform="translate(95 25)">
        <rect
          x="-5"
          y="-5"
          width="180"
          height="180"
          rx="12"
          fill="#1c1107"
          stroke="#d97706"
          strokeWidth="2"
        />

        <rect
          x="60"
          y="0"
          width="50"
          height="170"
          fill="#2b1a0d"
          stroke="#78350f"
          strokeWidth="1"
        />
        <rect
          x="0"
          y="60"
          width="170"
          height="50"
          fill="#2b1a0d"
          stroke="#78350f"
          strokeWidth="1"
        />

        <rect
          x="60"
          y="60"
          width="50"
          height="50"
          fill="#451a03"
          stroke="#f59e0b"
          strokeWidth="1.5"
        />

        <polygon points="60,60 110,60 85,85" fill="#dc2626" opacity="0.6" />
        <polygon points="110,60 110,110 85,85" fill="#eab308" opacity="0.6" />
        <polygon points="60,110 110,110 85,85" fill="#16a34a" opacity="0.6" />
        <polygon points="60,60 60,110 85,85" fill="#2563eb" opacity="0.6" />

        <line
          x1="76.6"
          y1="0"
          x2="76.6"
          y2="60"
          stroke="#78350f"
          strokeWidth="0.8"
        />
        <line
          x1="93.3"
          y1="0"
          x2="93.3"
          y2="60"
          stroke="#78350f"
          strokeWidth="0.8"
        />
        <line
          x1="76.6"
          y1="110"
          x2="76.6"
          y2="170"
          stroke="#78350f"
          strokeWidth="0.8"
        />
        <line
          x1="93.3"
          y1="110"
          x2="93.3"
          y2="170"
          stroke="#78350f"
          strokeWidth="0.8"
        />

        <line
          x1="0"
          y1="76.6"
          x2="60"
          y2="76.6"
          stroke="#78350f"
          strokeWidth="0.8"
        />
        <line
          x1="0"
          y1="93.3"
          x2="60"
          y2="93.3"
          stroke="#78350f"
          strokeWidth="0.8"
        />
        <line
          x1="110"
          y1="76.6"
          x2="170"
          y2="76.6"
          stroke="#78350f"
          strokeWidth="0.8"
        />
        <line
          x1="110"
          y1="93.3"
          x2="170"
          y2="93.3"
          stroke="#78350f"
          strokeWidth="0.8"
        />

        {Array.from({ length: 4 }).map((_, i) => (
          <React.Fragment key={`cells-${i}`}>
            <line
              x1="60"
              y1={15 * (i + 1)}
              x2="110"
              y2={15 * (i + 1)}
              stroke="#78350f"
              strokeWidth="0.8"
            />
            <line
              x1="60"
              y1={110 + 15 * (i + 1)}
              x2="110"
              y2={110 + 15 * (i + 1)}
              stroke="#78350f"
              strokeWidth="0.8"
            />
            <line
              x1={15 * (i + 1)}
              y1="60"
              x2={15 * (i + 1)}
              y2="110"
              stroke="#78350f"
              strokeWidth="0.8"
            />
            <line
              x1={110 + 15 * (i + 1)}
              y1="60"
              x2={110 + 15 * (i + 1)}
              y2="110"
              stroke="#78350f"
              strokeWidth="0.8"
            />
          </React.Fragment>
        ))}

        <rect
          x="76.6"
          y="0"
          width="16.7"
          height="60"
          fill="#ef4444"
          opacity="0.3"
        />
        <rect
          x="110"
          y="76.6"
          width="60"
          height="16.7"
          fill="#f59e0b"
          opacity="0.3"
        />
        <rect
          x="76.6"
          y="110"
          width="16.7"
          height="60"
          fill="#22c55e"
          opacity="0.3"
        />
        <rect
          x="0"
          y="76.6"
          width="60"
          height="16.7"
          fill="#3b82f6"
          opacity="0.3"
        />

        <text
          x="68.3"
          y="23"
          textAnchor="middle"
          fill="#f59e0b"
          fontSize="10"
          fontWeight="bold"
        >
          ✕
        </text>
        <text
          x="101.6"
          y="155"
          textAnchor="middle"
          fill="#f59e0b"
          fontSize="10"
          fontWeight="bold"
        >
          ✕
        </text>
        <text
          x="22"
          y="102"
          textAnchor="middle"
          fill="#f59e0b"
          fontSize="10"
          fontWeight="bold"
        >
          ✕
        </text>
        <text
          x="152"
          y="73"
          textAnchor="middle"
          fill="#f59e0b"
          fontSize="10"
          fontWeight="bold"
        >
          ✕
        </text>

        <circle
          cx="85"
          cy="25"
          r="7"
          fill="url(#pch-pawn-red)"
          stroke="#fca5a5"
          strokeWidth="1"
          filter="url(#pch-shadow)"
        />
        <circle
          cx="145"
          cy="85"
          r="7"
          fill="url(#pch-pawn-yellow)"
          stroke="#fef08a"
          strokeWidth="1"
          filter="url(#pch-shadow)"
        />
        <circle
          cx="85"
          cy="145"
          r="7"
          fill="url(#pch-pawn-green)"
          stroke="#86efac"
          strokeWidth="1"
          filter="url(#pch-shadow)"
        />
        <circle
          cx="25"
          cy="85"
          r="7"
          fill="url(#pch-pawn-blue)"
          stroke="#93c5fd"
          strokeWidth="1"
          filter="url(#pch-shadow)"
        />

        <circle
          cx="85"
          cy="85"
          r="10"
          fill="#f59e0b"
          stroke="#ffffff"
          strokeWidth="1.5"
          filter="url(#pch-shadow)"
        />
        <text
          x="85"
          y="89"
          textAnchor="middle"
          fill="#451a03"
          fontSize="10"
          fontWeight="bold"
        >
          ★
        </text>
      </g>

      <g transform="translate(16 88)">
        <rect
          width="56"
          height="38"
          rx="6"
          fill="#1c1107"
          stroke="#f59e0b"
          strokeWidth="1"
          opacity="0.9"
        />
        <text
          x="28"
          y="16"
          textAnchor="middle"
          fill="#fcd34d"
          fontSize="8"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          ROLL 6
        </text>
        <text
          x="28"
          y="28"
          textAnchor="middle"
          fill="#fef3c7"
          fontSize="7"
          fontFamily="sans-serif"
        >
          Extra Turn
        </text>
      </g>

      <g transform="translate(288 88)">
        <rect
          width="56"
          height="38"
          rx="6"
          fill="#1c1107"
          stroke="#d97706"
          strokeWidth="1"
          opacity="0.9"
        />
        <text
          x="28"
          y="16"
          textAnchor="middle"
          fill="#fbbf24"
          fontSize="8"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          GOAL
        </text>
        <text
          x="28"
          y="28"
          textAnchor="middle"
          fill="#fef3c7"
          fontSize="7"
          fontFamily="sans-serif"
        >
          Home Haven
        </text>
      </g>
    </svg>
  );
}

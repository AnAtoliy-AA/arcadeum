import React from 'react';

export function HeartsRealCards() {
  return (
    <svg
      viewBox="0 0 360 220"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full select-none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="hrt-glow" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#dc2626" stopOpacity="0.28" />
          <stop offset="60%" stopColor="#991b1b" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#0a0305" stopOpacity="0" />
        </radialGradient>
        <filter
          id="hrt-card-shadow"
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
            floodOpacity="0.75"
          />
        </filter>
        <linearGradient id="hrt-card-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
        <linearGradient id="hrt-queen-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>

      <rect width="360" height="220" fill="#0b0305" />
      <rect width="360" height="220" fill="url(#hrt-glow)" />

      <circle
        cx="180"
        cy="110"
        r="88"
        fill="none"
        stroke="#f87171"
        strokeWidth="0.8"
        opacity="0.2"
        strokeDasharray="4 6"
      />

      <g
        transform="translate(68 122) rotate(-22) translate(-38 -58)"
        filter="url(#hrt-card-shadow)"
      >
        <rect
          width="76"
          height="116"
          rx="8"
          fill="#1c0d12"
          stroke="#f87171"
          strokeWidth="1.2"
        />
        <rect
          x="5"
          y="5"
          width="66"
          height="106"
          rx="5"
          fill="#18070b"
          opacity="0.95"
        />
        <text
          x="10"
          y="18"
          fill="#ef4444"
          fontSize="9"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          10♥
        </text>
        <circle cx="38" cy="54" r="18" fill="#ef4444" opacity="0.12" />
        <text x="38" y="62" textAnchor="middle" fill="#ef4444" fontSize="24">
          ♥
        </text>
        <text
          x="38"
          y="86"
          textAnchor="middle"
          fill="#fca5a5"
          fontSize="7.5"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          10 OF HEARTS
        </text>
        <text
          x="38"
          y="96"
          textAnchor="middle"
          fill="#f87171"
          fontSize="6"
          fontFamily="sans-serif"
        >
          +1 Penalty Point
        </text>
      </g>

      <g
        transform="translate(122 110) rotate(-11) translate(-38 -58)"
        filter="url(#hrt-card-shadow)"
      >
        <rect
          width="76"
          height="116"
          rx="8"
          fill="#1c0d12"
          stroke="#f87171"
          strokeWidth="1.2"
        />
        <rect
          x="5"
          y="5"
          width="66"
          height="106"
          rx="5"
          fill="#18070b"
          opacity="0.95"
        />
        <text
          x="10"
          y="18"
          fill="#ef4444"
          fontSize="9"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          K♥
        </text>
        <circle cx="38" cy="54" r="18" fill="#ef4444" opacity="0.15" />
        <text x="38" y="60" textAnchor="middle" fill="#fb7185" fontSize="22">
          👑
        </text>
        <text
          x="38"
          y="86"
          textAnchor="middle"
          fill="#fca5a5"
          fontSize="7.5"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          KING OF HEARTS
        </text>
        <text
          x="38"
          y="96"
          textAnchor="middle"
          fill="#f87171"
          fontSize="6"
          fontFamily="sans-serif"
        >
          +1 Penalty Point
        </text>
      </g>

      <g
        transform="translate(180 102) rotate(0) translate(-42 -64)"
        filter="url(#hrt-card-shadow)"
      >
        <rect
          width="84"
          height="128"
          rx="10"
          fill="url(#hrt-queen-grad)"
          stroke="#a855f7"
          strokeWidth="1.8"
        />
        <rect
          x="6"
          y="6"
          width="72"
          height="116"
          rx="7"
          fill="#0a0518"
          opacity="0.95"
        />
        <text
          x="12"
          y="20"
          fill="#c084fc"
          fontSize="10"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          Q♠
        </text>
        <text
          x="72"
          y="20"
          textAnchor="end"
          fill="#ef4444"
          fontSize="8"
          fontWeight="bold"
          fontFamily="monospace"
        >
          +13 PTS
        </text>
        <circle cx="42" cy="58" r="22" fill="#9333ea" opacity="0.25" />
        <text x="42" y="66" textAnchor="middle" fill="#d8b4fe" fontSize="26">
          ♠
        </text>
        <text
          x="42"
          y="94"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="8.5"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          BLACK MARIA
        </text>
        <text
          x="42"
          y="106"
          textAnchor="middle"
          fill="#f87171"
          fontSize="6.5"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          Queen of Spades (+13)
        </text>
      </g>

      <g
        transform="translate(238 110) rotate(11) translate(-38 -58)"
        filter="url(#hrt-card-shadow)"
      >
        <rect
          width="76"
          height="116"
          rx="8"
          fill="#1c0d12"
          stroke="#f87171"
          strokeWidth="1.2"
        />
        <rect
          x="5"
          y="5"
          width="66"
          height="106"
          rx="5"
          fill="#18070b"
          opacity="0.95"
        />
        <text
          x="10"
          y="18"
          fill="#ef4444"
          fontSize="9"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          A♥
        </text>
        <circle cx="38" cy="54" r="18" fill="#ef4444" opacity="0.2" />
        <text x="38" y="62" textAnchor="middle" fill="#ef4444" fontSize="24">
          ♥
        </text>
        <text
          x="38"
          y="86"
          textAnchor="middle"
          fill="#fca5a5"
          fontSize="7.5"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          ACE OF HEARTS
        </text>
        <text
          x="38"
          y="96"
          textAnchor="middle"
          fill="#f87171"
          fontSize="6"
          fontFamily="sans-serif"
        >
          Highest Heart
        </text>
      </g>

      <g
        transform="translate(292 122) rotate(22) translate(-38 -58)"
        filter="url(#hrt-card-shadow)"
      >
        <rect
          width="76"
          height="116"
          rx="8"
          fill="#09141d"
          stroke="#38bdf8"
          strokeWidth="1.2"
        />
        <rect
          x="5"
          y="5"
          width="66"
          height="106"
          rx="5"
          fill="#040b11"
          opacity="0.95"
        />
        <text
          x="10"
          y="18"
          fill="#38bdf8"
          fontSize="9"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          2♣
        </text>
        <circle cx="38" cy="54" r="18" fill="#0284c7" opacity="0.15" />
        <text x="38" y="62" textAnchor="middle" fill="#38bdf8" fontSize="22">
          ♣
        </text>
        <text
          x="38"
          y="86"
          textAnchor="middle"
          fill="#e0f2fe"
          fontSize="7.5"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          LEAD CARD
        </text>
        <text
          x="38"
          y="96"
          textAnchor="middle"
          fill="#7dd3fc"
          fontSize="6"
          fontFamily="sans-serif"
        >
          Starts Trick 1
        </text>
      </g>

      <g transform="translate(14 88)">
        <rect
          width="54"
          height="38"
          rx="6"
          fill="#1c0d12"
          stroke="#ef4444"
          strokeWidth="1"
          opacity="0.9"
        />
        <text
          x="27"
          y="16"
          textAnchor="middle"
          fill="#f87171"
          fontSize="8"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          PENALTY
        </text>
        <text
          x="27"
          y="28"
          textAnchor="middle"
          fill="#fecaca"
          fontSize="7"
          fontFamily="sans-serif"
        >
          Q♠ = 13 pts
        </text>
      </g>

      <g transform="translate(292 88)">
        <rect
          width="54"
          height="38"
          rx="6"
          fill="#1e1035"
          stroke="#a855f7"
          strokeWidth="1"
          opacity="0.9"
        />
        <text
          x="27"
          y="16"
          textAnchor="middle"
          fill="#c084fc"
          fontSize="8"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          MOON SHOT
        </text>
        <text
          x="27"
          y="28"
          textAnchor="middle"
          fill="#f3e8ff"
          fontSize="7"
          fontFamily="sans-serif"
        >
          All 26 pts
        </text>
      </g>
    </svg>
  );
}

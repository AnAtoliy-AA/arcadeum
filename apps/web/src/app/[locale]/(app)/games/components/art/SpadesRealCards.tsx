import React from 'react';

export function SpadesRealCards() {
  return (
    <svg
      viewBox="0 0 360 220"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full select-none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="spd-glow" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.28" />
          <stop offset="60%" stopColor="#1e40af" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#030712" stopOpacity="0" />
        </radialGradient>
        <filter
          id="spd-card-shadow"
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
            floodOpacity="0.8"
          />
        </filter>
        <linearGradient id="spd-ace-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>

      <rect width="360" height="220" fill="#030712" />
      <rect width="360" height="220" fill="url(#spd-glow)" />

      <circle
        cx="180"
        cy="110"
        r="88"
        fill="none"
        stroke="#60a5fa"
        strokeWidth="0.8"
        opacity="0.2"
        strokeDasharray="4 6"
      />

      <g
        transform="translate(68 122) rotate(-22) translate(-38 -58)"
        filter="url(#spd-card-shadow)"
      >
        <rect
          width="76"
          height="116"
          rx="8"
          fill="#0c1322"
          stroke="#3b82f6"
          strokeWidth="1.2"
        />
        <rect
          x="5"
          y="5"
          width="66"
          height="106"
          rx="5"
          fill="#050a14"
          opacity="0.95"
        />
        <text
          x="10"
          y="18"
          fill="#60a5fa"
          fontSize="9"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          10♠
        </text>
        <circle cx="38" cy="54" r="18" fill="#3b82f6" opacity="0.12" />
        <text x="38" y="62" textAnchor="middle" fill="#60a5fa" fontSize="24">
          ♠
        </text>
        <text
          x="38"
          y="86"
          textAnchor="middle"
          fill="#bfdbfe"
          fontSize="7.5"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          10 OF SPADES
        </text>
        <text
          x="38"
          y="96"
          textAnchor="middle"
          fill="#93c5fd"
          fontSize="6"
          fontFamily="sans-serif"
        >
          Trump Suit
        </text>
      </g>

      <g
        transform="translate(122 110) rotate(-11) translate(-38 -58)"
        filter="url(#spd-card-shadow)"
      >
        <rect
          width="76"
          height="116"
          rx="8"
          fill="#0c1322"
          stroke="#3b82f6"
          strokeWidth="1.2"
        />
        <rect
          x="5"
          y="5"
          width="66"
          height="106"
          rx="5"
          fill="#050a14"
          opacity="0.95"
        />
        <text
          x="10"
          y="18"
          fill="#60a5fa"
          fontSize="9"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          K♠
        </text>
        <circle cx="38" cy="54" r="18" fill="#3b82f6" opacity="0.15" />
        <text x="38" y="60" textAnchor="middle" fill="#93c5fd" fontSize="22">
          👑
        </text>
        <text
          x="38"
          y="86"
          textAnchor="middle"
          fill="#bfdbfe"
          fontSize="7.5"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          KING OF SPADES
        </text>
        <text
          x="38"
          y="96"
          textAnchor="middle"
          fill="#93c5fd"
          fontSize="6"
          fontFamily="sans-serif"
        >
          High Trump
        </text>
      </g>

      <g
        transform="translate(180 102) rotate(0) translate(-42 -64)"
        filter="url(#spd-card-shadow)"
      >
        <rect
          width="84"
          height="128"
          rx="10"
          fill="url(#spd-ace-grad)"
          stroke="#60a5fa"
          strokeWidth="1.8"
        />
        <rect
          x="6"
          y="6"
          width="72"
          height="116"
          rx="7"
          fill="#050b18"
          opacity="0.95"
        />
        <text
          x="12"
          y="20"
          fill="#93c5fd"
          fontSize="10"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          A♠
        </text>
        <text
          x="72"
          y="20"
          textAnchor="end"
          fill="#60a5fa"
          fontSize="8"
          fontWeight="bold"
          fontFamily="monospace"
        >
          TRUMP
        </text>
        <circle cx="42" cy="58" r="22" fill="#2563eb" opacity="0.25" />
        <text x="42" y="66" textAnchor="middle" fill="#60a5fa" fontSize="28">
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
          ACE OF SPADES
        </text>
        <text
          x="42"
          y="106"
          textAnchor="middle"
          fill="#93c5fd"
          fontSize="6.5"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          Highest Power Card
        </text>
      </g>

      <g
        transform="translate(238 110) rotate(11) translate(-38 -58)"
        filter="url(#spd-card-shadow)"
      >
        <rect
          width="76"
          height="116"
          rx="8"
          fill="#0c1322"
          stroke="#3b82f6"
          strokeWidth="1.2"
        />
        <rect
          x="5"
          y="5"
          width="66"
          height="106"
          rx="5"
          fill="#050a14"
          opacity="0.95"
        />
        <text
          x="10"
          y="18"
          fill="#60a5fa"
          fontSize="9"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          Q♠
        </text>
        <circle cx="38" cy="54" r="18" fill="#3b82f6" opacity="0.2" />
        <text x="38" y="62" textAnchor="middle" fill="#60a5fa" fontSize="24">
          ♠
        </text>
        <text
          x="38"
          y="86"
          textAnchor="middle"
          fill="#bfdbfe"
          fontSize="7.5"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          QUEEN OF SPADES
        </text>
        <text
          x="38"
          y="96"
          textAnchor="middle"
          fill="#93c5fd"
          fontSize="6"
          fontFamily="sans-serif"
        >
          High Trump
        </text>
      </g>

      <g
        transform="translate(292 122) rotate(22) translate(-38 -58)"
        filter="url(#spd-card-shadow)"
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
          J♦
        </text>
        <circle cx="38" cy="54" r="18" fill="#ef4444" opacity="0.15" />
        <text x="38" y="62" textAnchor="middle" fill="#ef4444" fontSize="22">
          ♦
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
          OFF SUIT
        </text>
        <text
          x="38"
          y="96"
          textAnchor="middle"
          fill="#f87171"
          fontSize="6"
          fontFamily="sans-serif"
        >
          Can Be Trumped
        </text>
      </g>

      <g transform="translate(14 88)">
        <rect
          width="54"
          height="38"
          rx="6"
          fill="#0c1322"
          stroke="#3b82f6"
          strokeWidth="1"
          opacity="0.9"
        />
        <text
          x="27"
          y="16"
          textAnchor="middle"
          fill="#60a5fa"
          fontSize="8"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          BID NIL
        </text>
        <text
          x="27"
          y="28"
          textAnchor="middle"
          fill="#bfdbfe"
          fontSize="7"
          fontFamily="sans-serif"
        >
          Bonus +100
        </text>
      </g>

      <g transform="translate(292 88)">
        <rect
          width="54"
          height="38"
          rx="6"
          fill="#0c1322"
          stroke="#2563eb"
          strokeWidth="1"
          opacity="0.9"
        />
        <text
          x="27"
          y="16"
          textAnchor="middle"
          fill="#93c5fd"
          fontSize="8"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          TRUMP
        </text>
        <text
          x="27"
          y="28"
          textAnchor="middle"
          fill="#dbeafe"
          fontSize="7"
          fontFamily="sans-serif"
        >
          Spades Win
        </text>
      </g>
    </svg>
  );
}

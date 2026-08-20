import React from 'react';

const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const ROWS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

export function SeaBattleRealBoard() {
  return (
    <svg
      viewBox="0 0 360 220"
      preserveAspectRatio="xMidYMid slice"
      className="w-full h-full select-none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="sea-radar-glow" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#0284c7" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#0369a1" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ship-hull" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="50%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <filter id="sea-drop" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="3"
            floodColor="#000000"
            floodOpacity="0.8"
          />
        </filter>
      </defs>

      <rect width="360" height="220" fill="#030712" />
      <rect width="360" height="220" fill="url(#sea-radar-glow)" />

      {/* Real 10x10 Naval Grid */}
      <g transform="translate(85 15)">
        <rect
          x="-10"
          y="-10"
          width="200"
          height="200"
          rx="8"
          fill="#0b132b"
          stroke="#0284c7"
          strokeWidth="1.5"
        />

        {/* Sonar Circles */}
        <circle
          cx="90"
          cy="90"
          r="75"
          fill="none"
          stroke="#0284c7"
          strokeWidth="0.6"
          opacity="0.25"
        />
        <circle
          cx="90"
          cy="90"
          r="45"
          fill="none"
          stroke="#0284c7"
          strokeWidth="0.6"
          opacity="0.3"
        />
        <circle
          cx="90"
          cy="90"
          r="15"
          fill="none"
          stroke="#0284c7"
          strokeWidth="0.6"
          opacity="0.35"
        />

        {/* Grid lines & squares */}
        {ROWS.map((row, r) =>
          COLS.map((col, c) => {
            const size = 18;
            const x = c * size;
            const y = r * size;
            return (
              <rect
                key={`${row}-${col}`}
                x={x}
                y={y}
                width={size}
                height={size}
                fill="#0f172a"
                fillOpacity="0.4"
                stroke="#1e293b"
                strokeWidth="0.5"
              />
            );
          }),
        )}

        {/* Coordinates */}
        {COLS.map((col, i) => (
          <text
            key={col}
            x={i * 18 + 9}
            y="-2"
            textAnchor="middle"
            fill="#38bdf8"
            fontSize="6.5"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {col}
          </text>
        ))}
        {ROWS.map((row, i) => (
          <text
            key={row}
            x="-5"
            y={i * 18 + 12}
            textAnchor="middle"
            fill="#38bdf8"
            fontSize="6.5"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {row}
          </text>
        ))}

        {/* Battleship (4 cells horizontal at row 2, cols B-E) */}
        <g transform="translate(18 36)" filter="url(#sea-drop)">
          <rect
            width="72"
            height="18"
            rx="7"
            fill="url(#ship-hull)"
            stroke="#64748b"
            strokeWidth="1"
          />
          <circle cx="14" cy="9" r="3" fill="#94a3b8" />
          <circle cx="36" cy="9" r="4" fill="#cbd5e1" />
          <circle cx="58" cy="9" r="3" fill="#94a3b8" />
        </g>

        {/* Cruiser (3 cells vertical at col H, rows 4-6) */}
        <g transform="translate(126 72)" filter="url(#sea-drop)">
          <rect
            width="18"
            height="54"
            rx="7"
            fill="url(#ship-hull)"
            stroke="#64748b"
            strokeWidth="1"
          />
          <circle cx="9" cy="12" r="3" fill="#94a3b8" />
          <circle cx="9" cy="27" r="3.5" fill="#cbd5e1" />
          <circle cx="9" cy="42" r="3" fill="#94a3b8" />
        </g>

        {/* Destroyer (2 cells horizontal at row 8, cols C-D) */}
        <g transform="translate(36 144)" filter="url(#sea-drop)">
          <rect
            width="36"
            height="18"
            rx="6"
            fill="url(#ship-hull)"
            stroke="#64748b"
            strokeWidth="1"
          />
          <circle cx="10" cy="9" r="2.5" fill="#94a3b8" />
          <circle cx="26" cy="9" r="2.5" fill="#94a3b8" />
        </g>

        {/* Hit Explosions 💥 on ships */}
        <g transform="translate(36 36)">
          <circle cx="9" cy="9" r="6" fill="#ef4444" opacity="0.3" />
          <circle cx="9" cy="9" r="3.5" fill="#ef4444" />
          <text
            x="9"
            y="12"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="8"
            fontWeight="bold"
          >
            ✕
          </text>
        </g>
        <g transform="translate(54 36)">
          <circle cx="9" cy="9" r="6" fill="#ef4444" opacity="0.3" />
          <circle cx="9" cy="9" r="3.5" fill="#ef4444" />
          <text
            x="9"
            y="12"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="8"
            fontWeight="bold"
          >
            ✕
          </text>
        </g>
        <g transform="translate(126 90)">
          <circle cx="9" cy="9" r="6" fill="#ef4444" opacity="0.3" />
          <circle cx="9" cy="9" r="3.5" fill="#ef4444" />
          <text
            x="9"
            y="12"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="8"
            fontWeight="bold"
          >
            ✕
          </text>
        </g>

        {/* Miss water splash dots */}
        <circle cx="9" cy="9" r="2" fill="#38bdf8" opacity="0.7" />
        <circle cx="90" cy="18" r="2" fill="#38bdf8" opacity="0.7" />
        <circle cx="72" cy="90" r="2" fill="#38bdf8" opacity="0.7" />
        <circle cx="144" cy="144" r="2" fill="#38bdf8" opacity="0.7" />
      </g>

      {/* Floating Tactical Badges */}
      <g transform="translate(18 90)">
        <rect
          width="52"
          height="38"
          rx="6"
          fill="#0f172a"
          stroke="#0284c7"
          strokeWidth="1"
          opacity="0.9"
        />
        <text
          x="26"
          y="16"
          textAnchor="middle"
          fill="#38bdf8"
          fontSize="8"
          fontWeight="bold"
        >
          RADAR
        </text>
        <text x="26" y="28" textAnchor="middle" fill="#e2e8f0" fontSize="7">
          10×10 Grid
        </text>
      </g>

      <g transform="translate(290 90)">
        <rect
          width="52"
          height="38"
          rx="6"
          fill="#0f172a"
          stroke="#ef4444"
          strokeWidth="1"
          opacity="0.9"
        />
        <text
          x="26"
          y="16"
          textAnchor="middle"
          fill="#f87171"
          fontSize="8"
          fontWeight="bold"
        >
          COMBAT
        </text>
        <text x="26" y="28" textAnchor="middle" fill="#e2e8f0" fontSize="7">
          Salvo Strike
        </text>
      </g>
    </svg>
  );
}

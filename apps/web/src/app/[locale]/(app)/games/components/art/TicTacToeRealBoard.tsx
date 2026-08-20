import React from 'react';

export function TicTacToeRealBoard() {
  return (
    <svg
      viewBox="0 0 360 220"
      preserveAspectRatio="xMidYMid slice"
      className="w-full h-full select-none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="ttt-glow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
          <stop offset="60%" stopColor="#0891b2" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#030712" stopOpacity="0" />
        </radialGradient>
        <filter id="ttt-neon-x" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="ttt-neon-o" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <rect width="360" height="220" fill="#030712" />
      <rect width="360" height="220" fill="url(#ttt-glow)" />

      {/* Real 3x3 Grid Matrix */}
      <g transform="translate(95 25)">
        <rect
          x="-10"
          y="-10"
          width="190"
          height="190"
          rx="12"
          fill="#0f172a"
          stroke="#1e293b"
          strokeWidth="2"
        />

        {/* Grid Lines */}
        <line
          x1="56"
          y1="0"
          x2="56"
          y2="170"
          stroke="#334155"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="114"
          y1="0"
          x2="114"
          y2="170"
          stroke="#334155"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="0"
          y1="56"
          x2="170"
          y2="56"
          stroke="#334155"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="0"
          y1="114"
          x2="170"
          y2="114"
          stroke="#334155"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Cell 0,0: O */}
        <circle
          cx="28"
          cy="28"
          r="18"
          fill="none"
          stroke="#10b981"
          strokeWidth="4.5"
          filter="url(#ttt-neon-o)"
        />

        {/* Cell 0,1: X */}
        <g transform="translate(85 28)" filter="url(#ttt-neon-x)">
          <line
            x1="-15"
            y1="-15"
            x2="15"
            y2="15"
            stroke="#ef4444"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <line
            x1="15"
            y1="-15"
            x2="-15"
            y2="15"
            stroke="#ef4444"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </g>

        {/* Cell 0,2: X */}
        <g transform="translate(142 28)" filter="url(#ttt-neon-x)">
          <line
            x1="-15"
            y1="-15"
            x2="15"
            y2="15"
            stroke="#ef4444"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <line
            x1="15"
            y1="-15"
            x2="-15"
            y2="15"
            stroke="#ef4444"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </g>

        {/* Cell 1,0: X */}
        <g transform="translate(28 85)" filter="url(#ttt-neon-x)">
          <line
            x1="-15"
            y1="-15"
            x2="15"
            y2="15"
            stroke="#ef4444"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <line
            x1="15"
            y1="-15"
            x2="-15"
            y2="15"
            stroke="#ef4444"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </g>

        {/* Cell 1,1: O (Winning diagonal piece) */}
        <circle
          cx="85"
          cy="85"
          r="19"
          fill="none"
          stroke="#34d399"
          strokeWidth="5"
          filter="url(#ttt-neon-o)"
        />

        {/* Cell 1,2: O */}
        <circle
          cx="142"
          cy="85"
          r="18"
          fill="none"
          stroke="#10b981"
          strokeWidth="4.5"
          filter="url(#ttt-neon-o)"
        />

        {/* Cell 2,0: X */}
        <g transform="translate(28 142)" filter="url(#ttt-neon-x)">
          <line
            x1="-15"
            y1="-15"
            x2="15"
            y2="15"
            stroke="#ef4444"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <line
            x1="15"
            y1="-15"
            x2="-15"
            y2="15"
            stroke="#ef4444"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </g>

        {/* Cell 2,1: X */}
        <g transform="translate(85 142)" filter="url(#ttt-neon-x)">
          <line
            x1="-15"
            y1="-15"
            x2="15"
            y2="15"
            stroke="#ef4444"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <line
            x1="15"
            y1="-15"
            x2="-15"
            y2="15"
            stroke="#ef4444"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </g>

        {/* Cell 2,2: O (Winning diagonal piece) */}
        <circle
          cx="142"
          cy="142"
          r="19"
          fill="none"
          stroke="#34d399"
          strokeWidth="5"
          filter="url(#ttt-neon-o)"
        />

        {/* Diagonal 3-in-a-row Winning Strike Line */}
        <line
          x1="10"
          y1="10"
          x2="160"
          y2="160"
          stroke="#fef08a"
          strokeWidth="4"
          strokeLinecap="round"
          filter="url(#ttt-neon-o)"
        />
      </g>

      {/* Floating Badges */}
      <g transform="translate(18 90)">
        <rect
          width="56"
          height="38"
          rx="6"
          fill="#0f172a"
          stroke="#10b981"
          strokeWidth="1"
          opacity="0.9"
        />
        <text
          x="28"
          y="16"
          textAnchor="middle"
          fill="#34d399"
          fontSize="8"
          fontWeight="bold"
        >
          MATCH
        </text>
        <text x="28" y="28" textAnchor="middle" fill="#e2e8f0" fontSize="7">
          3 in a Row
        </text>
      </g>

      <g transform="translate(286 90)">
        <rect
          width="56"
          height="38"
          rx="6"
          fill="#0f172a"
          stroke="#06b6d4"
          strokeWidth="1"
          opacity="0.9"
        />
        <text
          x="28"
          y="16"
          textAnchor="middle"
          fill="#22d3ee"
          fontSize="8"
          fontWeight="bold"
        >
          VARIANTS
        </text>
        <text x="28" y="28" textAnchor="middle" fill="#e2e8f0" fontSize="7">
          3×3, 5×5, 7×7
        </text>
      </g>
    </svg>
  );
}

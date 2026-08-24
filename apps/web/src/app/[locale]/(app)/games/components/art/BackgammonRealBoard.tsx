import React from 'react';

export function BackgammonRealBoard() {
  return (
    <svg
      aria-hidden="true"
      className="w-full h-full select-none"
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 0 360 220"
    >
      <defs>
        <radialGradient cx="50%" cy="50%" id="bg-board-glow" r="65%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.22" />
          <stop offset="60%" stopColor="#6b21a8" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#0a0514" stopOpacity="0" />
        </radialGradient>
        <filter height="140%" id="bg-shadow" width="140%" x="-20%" y="-20%">
          <feDropShadow
            dx="0"
            dy="3"
            floodColor="#000000"
            floodOpacity="0.8"
            stdDeviation="3"
          />
        </filter>
        <linearGradient id="bg-purple-piece" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#7e22ce" />
        </linearGradient>
        <linearGradient id="bg-white-piece" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#fafaf9" />
          <stop offset="100%" stopColor="#d6d3d1" />
        </linearGradient>
      </defs>

      <rect fill="#0a0514" height="220" width="360" />
      <rect fill="url(#bg-board-glow)" height="220" width="360" />

      <g transform="translate(45 15)">
        <rect
          fill="#1e1035"
          height="190"
          rx="10"
          stroke="#9333ea"
          strokeWidth="2"
          width="270"
          x="0"
          y="0"
        />

        <rect fill="#130924" height="180" rx="6" width="260" x="5" y="5" />

        <rect fill="#2e1065" height="180" width="20" x="125" y="5" />

        {Array.from({ length: 6 }).map((_, i) => {
          const w = 18;
          const x = 10 + i * 19;
          const fill = i % 2 === 0 ? '#4c1d95' : '#7c3aed';
          return (
            <polygon
              fill={fill}
              key={`top-l-${i}`}
              points={`${x},5 ${x + w},5 ${x + w / 2},75`}
            />
          );
        })}

        {Array.from({ length: 6 }).map((_, i) => {
          const w = 18;
          const x = 150 + i * 19;
          const fill = i % 2 === 1 ? '#4c1d95' : '#7c3aed';
          return (
            <polygon
              fill={fill}
              key={`top-r-${i}`}
              points={`${x},5 ${x + w},5 ${x + w / 2},75`}
            />
          );
        })}

        {Array.from({ length: 6 }).map((_, i) => {
          const w = 18;
          const x = 10 + i * 19;
          const fill = i % 2 === 1 ? '#4c1d95' : '#7c3aed';
          return (
            <polygon
              fill={fill}
              key={`bot-l-${i}`}
              points={`${x},185 ${x + w},185 ${x + w / 2},115`}
            />
          );
        })}

        {Array.from({ length: 6 }).map((_, i) => {
          const w = 18;
          const x = 150 + i * 19;
          const fill = i % 2 === 0 ? '#4c1d95' : '#7c3aed';
          return (
            <polygon
              fill={fill}
              key={`bot-r-${i}`}
              points={`${x},185 ${x + w},185 ${x + w / 2},115`}
            />
          );
        })}

        <circle
          cx="19"
          cy="16"
          fill="url(#bg-white-piece)"
          filter="url(#bg-shadow)"
          r="8"
          stroke="#ffffff"
          strokeWidth="1"
        />
        <circle
          cx="19"
          cy="32"
          fill="url(#bg-white-piece)"
          filter="url(#bg-shadow)"
          r="8"
          stroke="#ffffff"
          strokeWidth="1"
        />

        <circle
          cx="245"
          cy="16"
          fill="url(#bg-purple-piece)"
          filter="url(#bg-shadow)"
          r="8"
          stroke="#d8b4fe"
          strokeWidth="1"
        />
        <circle
          cx="245"
          cy="32"
          fill="url(#bg-purple-piece)"
          filter="url(#bg-shadow)"
          r="8"
          stroke="#d8b4fe"
          strokeWidth="1"
        />

        <circle
          cx="245"
          cy="174"
          fill="url(#bg-white-piece)"
          filter="url(#bg-shadow)"
          r="8"
          stroke="#ffffff"
          strokeWidth="1"
        />
        <circle
          cx="245"
          cy="158"
          fill="url(#bg-white-piece)"
          filter="url(#bg-shadow)"
          r="8"
          stroke="#ffffff"
          strokeWidth="1"
        />

        <g transform="translate(100 83)">
          <rect
            fill="#3b0764"
            filter="url(#bg-shadow)"
            height="24"
            rx="4"
            stroke="#a855f7"
            strokeWidth="1.5"
            width="24"
            x="0"
            y="0"
          />
          <circle cx="6" cy="6" fill="#f3e8ff" r="2" />
          <circle cx="12" cy="12" fill="#f3e8ff" r="2" />
          <circle cx="18" cy="18" fill="#f3e8ff" r="2" />
        </g>

        <g transform="translate(146 83)">
          <rect
            fill="#3b0764"
            filter="url(#bg-shadow)"
            height="24"
            rx="4"
            stroke="#a855f7"
            strokeWidth="1.5"
            width="24"
            x="0"
            y="0"
          />
          <circle cx="6" cy="6" fill="#f3e8ff" r="2" />
          <circle cx="18" cy="6" fill="#f3e8ff" r="2" />
          <circle cx="12" cy="12" fill="#f3e8ff" r="2" />
          <circle cx="6" cy="18" fill="#f3e8ff" r="2" />
          <circle cx="18" cy="18" fill="#f3e8ff" r="2" />
        </g>
      </g>
    </svg>
  );
}

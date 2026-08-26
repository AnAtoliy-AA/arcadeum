export function CheckersSymbol({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      className={className}
    >
      {/* Board grid */}
      <rect
        x="8"
        y="8"
        width="48"
        height="48"
        rx="4"
        strokeWidth="2"
        opacity="0.3"
      />
      <line x1="20" y1="8" x2="20" y2="56" strokeWidth="1.5" opacity="0.2" />
      <line x1="32" y1="8" x2="32" y2="56" strokeWidth="1.5" opacity="0.2" />
      <line x1="44" y1="8" x2="44" y2="56" strokeWidth="1.5" opacity="0.2" />
      <line x1="8" y1="20" x2="56" y2="20" strokeWidth="1.5" opacity="0.2" />
      <line x1="8" y1="32" x2="56" y2="32" strokeWidth="1.5" opacity="0.2" />
      <line x1="8" y1="44" x2="56" y2="44" strokeWidth="1.5" opacity="0.2" />

      {/* Light pieces (top) */}
      <circle
        cx="14"
        cy="14"
        r="5"
        fill="#d4d4d8"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle
        cx="38"
        cy="14"
        r="5"
        fill="#d4d4d8"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      {/* Dark pieces (bottom) */}
      <circle
        cx="26"
        cy="50"
        r="5"
        fill="#3f3f46"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle
        cx="50"
        cy="50"
        r="5"
        fill="#3f3f46"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      {/* King crown on one dark piece */}
      <text
        x="26"
        y="52"
        textAnchor="middle"
        fontSize="8"
        fill="currentColor"
        stroke="none"
      >
        ♚
      </text>
    </svg>
  );
}

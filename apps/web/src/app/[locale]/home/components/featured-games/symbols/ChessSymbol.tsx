export function ChessSymbol({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <rect x="8" y="8" width="48" height="48" rx="3" />
      <line x1="14" y1="8" x2="14" y2="56" />
      <line x1="20" y1="8" x2="20" y2="56" />
      <line x1="26" y1="8" x2="26" y2="56" />
      <line x1="32" y1="8" x2="32" y2="56" />
      <line x1="38" y1="8" x2="38" y2="56" />
      <line x1="44" y1="8" x2="44" y2="56" />
      <line x1="50" y1="8" x2="50" y2="56" />
      <line x1="8" y1="14" x2="56" y2="14" />
      <line x1="8" y1="20" x2="56" y2="20" />
      <line x1="8" y1="26" x2="56" y2="26" />
      <line x1="8" y1="32" x2="56" y2="32" />
      <line x1="8" y1="38" x2="56" y2="38" />
      <line x1="8" y1="44" x2="56" y2="44" />
      <line x1="8" y1="50" x2="56" y2="50" />
      <text
        x="32"
        y="36"
        textAnchor="middle"
        fill="currentColor"
        stroke="none"
        fontSize="18"
        fontWeight="bold"
      >
        ♚
      </text>
    </svg>
  );
}

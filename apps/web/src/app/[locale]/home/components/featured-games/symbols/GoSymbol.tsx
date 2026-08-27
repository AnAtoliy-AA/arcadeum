export function GoSymbol({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      {/* Board frame */}
      <rect x="8" y="8" width="48" height="48" rx="3" />
      {/* Grid lines */}
      <line x1="16.5" y1="8" x2="16.5" y2="56" />
      <line x1="25" y1="8" x2="25" y2="56" />
      <line x1="33.5" y1="8" x2="33.5" y2="56" />
      <line x1="42" y1="8" x2="42" y2="56" />
      <line x1="50.5" y1="8" x2="50.5" y2="56" opacity={0} />
      <line x1="8" y1="16.5" x2="56" y2="16.5" />
      <line x1="8" y1="25" x2="56" y2="25" />
      <line x1="8" y1="33.5" x2="56" y2="33.5" />
      <line x1="8" y1="42" x2="56" y2="42" />
      <line x1="8" y1="50.5" x2="56" y2="50.5" />
      {/* Stones (fill via currentColor for monochrome consistency) */}
      <circle cx="25" cy="25" r="5.4" fill="currentColor" stroke="none" />
      <circle
        cx="42"
        cy="33.5"
        r="5.4"
        fill="currentColor"
        stroke="none"
        opacity={0.35}
      />
      <circle cx="33.5" cy="42" r="5.4" fill="currentColor" stroke="none" />
      <circle
        cx="16.5"
        cy="42"
        r="5.4"
        fill="currentColor"
        stroke="none"
        opacity={0.35}
      />
    </svg>
  );
}

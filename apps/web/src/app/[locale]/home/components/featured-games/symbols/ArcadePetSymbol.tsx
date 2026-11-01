export function ArcadePetSymbol({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
      strokeLinecap="round"
      className={className}
    >
      <ellipse cx="32" cy="34" rx="20" ry="24" strokeWidth="2" />
      <circle cx="25" cy="28" r="2.5" fill="currentColor" />
      <circle cx="39" cy="28" r="2.5" fill="currentColor" />
      <path d="M 28 38 Q 32 42 36 38" strokeWidth="2" />
      <path d="M 18 18 L 22 24" strokeWidth="2" />
      <path d="M 46 18 L 42 24" strokeWidth="2" />
      <circle cx="20" cy="54" r="3" />
      <circle cx="32" cy="56" r="3" />
      <circle cx="44" cy="54" r="3" />
    </svg>
  );
}

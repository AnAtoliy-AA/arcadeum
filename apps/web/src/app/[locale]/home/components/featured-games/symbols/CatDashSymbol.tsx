export function CatDashSymbol({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Cat head */}
      <circle cx="32" cy="28" r="14" />
      {/* Ears */}
      <path d="M22 18 L18 8 L26 15" />
      <path d="M42 18 L46 8 L38 15" />
      {/* Eyes */}
      <circle cx="27" cy="26" r="2" fill="currentColor" />
      <circle cx="37" cy="26" r="2" fill="currentColor" />
      {/* Nose */}
      <path d="M32 30 L30 33 L34 33 Z" fill="currentColor" />
      {/* Whiskers */}
      <path d="M18 28 L26 30" />
      <path d="M18 32 L26 32" />
      <path d="M46 28 L38 30" />
      <path d="M46 32 L38 32" />
      {/* Dice */}
      <rect x="42" y="42" width="14" height="14" rx="2" />
      <circle cx="46" cy="46" r="1" fill="currentColor" />
      <circle cx="52" cy="46" r="1" fill="currentColor" />
      <circle cx="49" cy="49" r="1" fill="currentColor" />
      <circle cx="46" cy="52" r="1" fill="currentColor" />
      <circle cx="52" cy="52" r="1" fill="currentColor" />
    </svg>
  );
}

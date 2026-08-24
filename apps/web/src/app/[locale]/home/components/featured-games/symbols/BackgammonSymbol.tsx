import type { SVGProps } from 'react';

interface BackgammonSymbolProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

export function BackgammonSymbol({ className }: BackgammonSymbolProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        height="48"
        opacity="0.3"
        rx="4"
        strokeWidth="2"
        width="48"
        x="8"
        y="8"
      />
      <line opacity="0.3" strokeWidth="2" x1="32" x2="32" y1="8" y2="56" />

      <polygon fill="currentColor" opacity="0.4" points="8,8 16,8 12,28" />
      <polygon fill="currentColor" opacity="0.2" points="16,8 24,8 20,28" />
      <polygon fill="currentColor" opacity="0.4" points="24,8 32,8 28,28" />

      <polygon fill="currentColor" opacity="0.2" points="32,8 40,8 36,28" />
      <polygon fill="currentColor" opacity="0.4" points="40,8 48,8 44,28" />
      <polygon fill="currentColor" opacity="0.2" points="48,8 56,8 52,28" />

      <polygon fill="currentColor" opacity="0.2" points="8,56 16,56 12,36" />
      <polygon fill="currentColor" opacity="0.4" points="16,56 24,56 20,36" />
      <polygon fill="currentColor" opacity="0.2" points="24,56 32,56 28,36" />

      <polygon fill="currentColor" opacity="0.4" points="32,56 40,56 36,36" />
      <polygon fill="currentColor" opacity="0.2" points="40,56 48,56 44,36" />
      <polygon fill="currentColor" opacity="0.4" points="48,56 56,56 52,36" />

      <circle
        cx="12"
        cy="14"
        fill="#a855f7"
        r="3.5"
        stroke="currentColor"
        strokeWidth="1"
      />
      <circle
        cx="52"
        cy="50"
        fill="#f43f5e"
        r="3.5"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}

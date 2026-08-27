import type { SVGProps } from 'react';

interface SolitaireSymbolProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

export function SolitaireSymbol({ className }: SolitaireSymbolProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="12"
        y="8"
        width="26"
        height="38"
        rx="4"
        strokeWidth="2"
        opacity="0.3"
        transform="rotate(-12 25 27)"
      />
      <rect
        x="24"
        y="14"
        width="26"
        height="38"
        rx="4"
        strokeWidth="2"
        opacity="0.6"
        transform="rotate(6 37 33)"
      />
      <rect
        x="18"
        y="12"
        width="28"
        height="40"
        rx="4"
        strokeWidth="2.2"
        fill="currentColor"
        fillOpacity="0.08"
      />
      <path
        d="M32 24 C32 20 28 18 25 21 C22 24 22 28 32 36 C42 28 42 24 39 21 C36 18 32 20 32 24 Z"
        fill="currentColor"
        opacity="0.8"
      />
      <path
        d="M32 40 C30 43 27 46 25 46 C23 46 22 44.5 22 43 C22 40 28 37 32 34 C36 37 42 40 42 43 C42 44.5 41 46 39 46 C37 46 34 43 32 40 Z"
        fill="currentColor"
        opacity="0.8"
      />
      <path
        d="M31 42 L33 42 L34 48 L30 48 Z"
        fill="currentColor"
        opacity="0.8"
      />
    </svg>
  );
}

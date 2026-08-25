import type { SVGProps } from 'react';

interface SudokuSymbolProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

export function SudokuSymbol({ className }: SudokuSymbolProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="10"
        y="10"
        width="44"
        height="44"
        rx="6"
        strokeWidth="2.5"
        fill="currentColor"
        fillOpacity="0.06"
      />
      <line x1="24.6" y1="10" x2="24.6" y2="54" strokeWidth="1.8" />
      <line x1="39.3" y1="10" x2="39.3" y2="54" strokeWidth="1.8" />
      <line x1="10" y1="24.6" x2="54" y2="24.6" strokeWidth="1.8" />
      <line x1="10" y1="39.3" x2="54" y2="39.3" strokeWidth="1.8" />
      <circle
        cx="17.3"
        cy="17.3"
        r="2.5"
        fill="currentColor"
        opacity="0.8"
        stroke="none"
      />
      <circle
        cx="32"
        cy="17.3"
        r="2.5"
        fill="currentColor"
        opacity="0.4"
        stroke="none"
      />
      <circle
        cx="46.6"
        cy="32"
        r="2.5"
        fill="currentColor"
        opacity="0.8"
        stroke="none"
      />
      <circle
        cx="17.3"
        cy="46.6"
        r="2.5"
        fill="currentColor"
        opacity="0.5"
        stroke="none"
      />
      <circle
        cx="32"
        cy="46.6"
        r="2.5"
        fill="currentColor"
        opacity="0.8"
        stroke="none"
      />
    </svg>
  );
}

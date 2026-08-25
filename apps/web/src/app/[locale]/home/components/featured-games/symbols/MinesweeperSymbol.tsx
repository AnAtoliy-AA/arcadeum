import type { SVGProps } from 'react';

interface MinesweeperSymbolProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

export function MinesweeperSymbol({ className }: MinesweeperSymbolProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="32"
        cy="34"
        r="16"
        strokeWidth="2.4"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <line
        x1="32"
        y1="12"
        x2="32"
        y2="18"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <line
        x1="32"
        y1="50"
        x2="32"
        y2="56"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <line
        x1="10"
        y1="34"
        x2="16"
        y2="34"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <line
        x1="48"
        y1="34"
        x2="54"
        y2="34"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <line
        x1="16"
        y1="18"
        x2="21"
        y2="23"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <line
        x1="43"
        y1="45"
        x2="48"
        y2="50"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <line
        x1="48"
        y1="18"
        x2="43"
        y2="23"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <line
        x1="21"
        y1="45"
        x2="16"
        y2="50"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle
        cx="27"
        cy="29"
        r="3"
        fill="currentColor"
        opacity="0.6"
        stroke="none"
      />
      <path d="M26 12 Q30 6 36 8" strokeWidth="2" strokeLinecap="round" />
      <circle cx="37" cy="8" r="1.5" fill="#f59e0b" stroke="none" />
    </svg>
  );
}

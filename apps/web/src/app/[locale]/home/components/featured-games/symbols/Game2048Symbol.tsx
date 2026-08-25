import type { SVGProps } from 'react';

interface Game2048SymbolProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

export function Game2048Symbol({ className }: Game2048SymbolProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="8"
        y="8"
        width="48"
        height="48"
        rx="8"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.05"
      />
      <rect
        x="13"
        y="13"
        width="17"
        height="17"
        rx="4"
        fill="currentColor"
        fillOpacity="0.2"
        strokeWidth="1.5"
      />
      <rect
        x="34"
        y="13"
        width="17"
        height="17"
        rx="4"
        fill="currentColor"
        fillOpacity="0.4"
        strokeWidth="1.5"
      />
      <rect
        x="13"
        y="34"
        width="17"
        height="17"
        rx="4"
        fill="currentColor"
        fillOpacity="0.5"
        strokeWidth="1.5"
      />
      <rect
        x="34"
        y="34"
        width="17"
        height="17"
        rx="4"
        fill="currentColor"
        fillOpacity="0.9"
        strokeWidth="1.5"
      />
      <text
        x="42.5"
        y="45.5"
        textAnchor="middle"
        fontSize="8"
        fontWeight="bold"
        fill="#000000"
        stroke="none"
        fontFamily="sans-serif"
      >
        2k
      </text>
    </svg>
  );
}

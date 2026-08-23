import type { SVGProps } from 'react';

interface PachisiSymbolProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

export function PachisiSymbol({ className }: PachisiSymbolProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cross arms */}
      <rect
        height="16"
        opacity="0.25"
        rx="3"
        strokeWidth="2"
        width="48"
        x="8"
        y="24"
      />
      <rect
        height="48"
        opacity="0.25"
        rx="3"
        strokeWidth="2"
        width="16"
        x="24"
        y="8"
      />

      {/* Center home */}
      <rect
        fill="currentColor"
        height="12"
        opacity="0.4"
        rx="2"
        width="12"
        x="26"
        y="26"
      />

      {/* Track dots */}
      <circle cx="14" cy="32" fill="currentColor" opacity="0.5" r="2" />
      <circle cx="22" cy="32" fill="currentColor" opacity="0.5" r="2" />
      <circle cx="42" cy="32" fill="currentColor" opacity="0.5" r="2" />
      <circle cx="50" cy="32" fill="currentColor" opacity="0.5" r="2" />
      <circle cx="32" cy="14" fill="currentColor" opacity="0.5" r="2" />
      <circle cx="32" cy="22" fill="currentColor" opacity="0.5" r="2" />
      <circle cx="32" cy="42" fill="currentColor" opacity="0.5" r="2" />
      <circle cx="32" cy="50" fill="currentColor" opacity="0.5" r="2" />

      {/* Tokens */}
      <circle cx="15" cy="15" fill="#ef4444" r="4" strokeWidth="1.5" />
      <circle cx="49" cy="15" fill="#22c55e" r="4" strokeWidth="1.5" />
      <circle cx="49" cy="49" fill="#eab308" r="4" strokeWidth="1.5" />
    </svg>
  );
}

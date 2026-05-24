import type { SVGProps } from 'react';

export function CriticalSymbol(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <rect
        x="14"
        y="10"
        width="28"
        height="42"
        rx="4"
        transform="rotate(-8 28 31)"
      />
      <rect
        x="22"
        y="12"
        width="28"
        height="42"
        rx="4"
        transform="rotate(6 36 33)"
      />
      <line x1="30" y1="22" x2="42" y2="34" />
      <line x1="42" y1="22" x2="30" y2="34" />
    </svg>
  );
}

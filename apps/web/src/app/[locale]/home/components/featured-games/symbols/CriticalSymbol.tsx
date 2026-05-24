import type { SVGProps } from 'react';

export function CriticalSymbol(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
      strokeLinecap="round"
      {...props}
    >
      {/* Back card — tilted left, partially hidden behind the others */}
      <rect
        x="13"
        y="14"
        width="22"
        height="34"
        rx="3"
        transform="rotate(-18 24 31)"
        opacity="0.55"
      />
      {/* Middle card — sits behind the front card, gently tilted right */}
      <rect
        x="21"
        y="13"
        width="22"
        height="34"
        rx="3"
        transform="rotate(-2 32 30)"
        opacity="0.8"
      />
      {/* Front card — frontmost of the fan */}
      <rect
        x="29"
        y="12"
        width="22"
        height="34"
        rx="3"
        transform="rotate(14 40 29)"
      />
    </svg>
  );
}

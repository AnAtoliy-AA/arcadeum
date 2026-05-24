import type { SVGProps } from 'react';

export function CriticalSymbol(props: SVGProps<SVGSVGElement>) {
  // Three cards fanned out from a shared pivot near the bottom of the
  // viewBox. Drawn back-to-front so the rightmost card sits on top.
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
      <rect
        x="19.5"
        y="17"
        width="25"
        height="39"
        rx="3.25"
        transform="rotate(-20 32 56)"
        opacity="0.55"
      />
      <rect
        x="19.5"
        y="17"
        width="25"
        height="39"
        rx="3.25"
        transform="rotate(0 32 56)"
        opacity="0.8"
      />
      <rect
        x="19.5"
        y="17"
        width="25"
        height="39"
        rx="3.25"
        transform="rotate(20 32 56)"
      />
    </svg>
  );
}

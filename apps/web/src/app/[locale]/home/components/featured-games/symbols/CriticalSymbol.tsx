import type { SVGProps } from 'react';

export function CriticalSymbol(props: SVGProps<SVGSVGElement>) {
  // Five cards fanned out from a shared pivot near the bottom of the
  // viewBox, like a held hand. All cards share the same base rect; only
  // the rotation angle and opacity differ. Drawing order is back-to-front
  // (left → right), so the rightmost card sits on top.
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
        x="24"
        y="30"
        width="16"
        height="26"
        rx="2.5"
        transform="rotate(-28 32 56)"
        opacity="0.45"
      />
      <rect
        x="24"
        y="30"
        width="16"
        height="26"
        rx="2.5"
        transform="rotate(-14 32 56)"
        opacity="0.65"
      />
      <rect
        x="24"
        y="30"
        width="16"
        height="26"
        rx="2.5"
        transform="rotate(0 32 56)"
        opacity="0.85"
      />
      <rect
        x="24"
        y="30"
        width="16"
        height="26"
        rx="2.5"
        transform="rotate(14 32 56)"
        opacity="0.95"
      />
      <rect
        x="24"
        y="30"
        width="16"
        height="26"
        rx="2.5"
        transform="rotate(28 32 56)"
      />
    </svg>
  );
}

import type { SVGProps } from 'react';

export function CascadeSymbol(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Three cards in a fan — the Cascade silhouette */}
      <g transform="translate(32 38) rotate(-18)">
        <rect x="-12" y="-18" width="24" height="34" rx="3" />
      </g>
      <g transform="translate(32 36)">
        <rect x="-12" y="-18" width="24" height="34" rx="3" />
      </g>
      <g transform="translate(32 38) rotate(18)">
        <rect x="-12" y="-18" width="24" height="34" rx="3" />
      </g>
      {/* Cascade arrow / penalty drop */}
      <path d="M14 12 L20 6 L26 12" />
      <path d="M38 12 L44 6 L50 12" />
    </svg>
  );
}

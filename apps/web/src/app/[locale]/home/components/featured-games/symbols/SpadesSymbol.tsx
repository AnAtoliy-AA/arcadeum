import type { SVGProps } from 'react';

export function SpadesSymbol(props: SVGProps<SVGSVGElement>) {
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
      {/* Two facing card seats — partnership table silhouette */}
      <g transform="translate(20 24) rotate(-10)">
        <rect x="-9" y="-14" width="18" height="28" rx="3" />
      </g>
      <g transform="translate(44 40) rotate(-10)">
        <rect x="-9" y="-14" width="18" height="28" rx="3" />
      </g>
      <g transform="translate(44 24) rotate(10)">
        <rect x="-9" y="-14" width="18" height="28" rx="3" />
      </g>
      <g transform="translate(20 40) rotate(10)">
        <rect x="-9" y="-14" width="18" height="28" rx="3" />
      </g>
      {/* Spade pip at the centre of the table */}
      <path d="M32 34 c-4.5 -4 -7.5 -6.5 -7.5 -9.5 a3.8 3.8 0 0 1 7.5 -1.2 a3.8 3.8 0 0 1 7.5 1.2 c0 3 -3 5.5 -7.5 9.5 z" />
      <path d="M32 34 v6 M29 40 h6" />
    </svg>
  );
}

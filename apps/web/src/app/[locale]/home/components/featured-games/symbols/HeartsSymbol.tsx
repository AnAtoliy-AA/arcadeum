import type { SVGProps } from 'react';

export function HeartsSymbol(props: SVGProps<SVGSVGElement>) {
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
      {/* Three cards in a fan — trick-taking table silhouette */}
      <g transform="translate(22 26) rotate(-14)">
        <rect x="-10" y="-15" width="20" height="30" rx="3" />
      </g>
      <g transform="translate(42 26) rotate(14)">
        <rect x="-10" y="-15" width="20" height="30" rx="3" />
      </g>
      <g transform="translate(32 36)">
        <rect x="-11" y="-16" width="22" height="32" rx="3" />
      </g>
      {/* Heart pip on the front card */}
      <path d="M32 42 c-5.5 -5 -9 -8 -9 -11.5 a4.6 4.6 0 0 1 9 -1.6 a4.6 4.6 0 0 1 9 1.6 c0 3.5 -3.5 6.5 -9 11.5 z" />
      {/* Broken-hearts slash */}
      <path d="M32 29 l-3 5 l5 3" />
    </svg>
  );
}

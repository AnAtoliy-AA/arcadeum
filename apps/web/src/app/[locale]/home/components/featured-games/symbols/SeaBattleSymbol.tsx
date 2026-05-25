import type { SVGProps } from 'react';

export function SeaBattleSymbol(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <rect x="12" y="12" width="40" height="40" rx="3" />
      <line x1="22" y1="12" x2="22" y2="52" />
      <line x1="32" y1="12" x2="32" y2="52" />
      <line x1="42" y1="12" x2="42" y2="52" />
      <line x1="12" y1="22" x2="52" y2="22" />
      <line x1="12" y1="32" x2="52" y2="32" />
      <line x1="12" y1="42" x2="52" y2="42" />
      <circle cx="27" cy="27" r="3" fill="currentColor" stroke="none" />
      <circle
        cx="47"
        cy="47"
        r="3"
        fill="currentColor"
        stroke="none"
        opacity="0.5"
      />
    </svg>
  );
}

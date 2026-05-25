import type { SVGProps } from 'react';

export function GlimwormSymbol(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      {...props}
    >
      <path d="M8 44 Q18 26 28 44 T48 44 T62 28" />
      <circle cx="62" cy="28" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="18" cy="36" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="36" cy="36" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="52" cy="36" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

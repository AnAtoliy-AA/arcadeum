import type { SVGProps } from 'react';

export function TicTacToeSymbol(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      {...props}
    >
      <line x1="26" y1="10" x2="26" y2="54" />
      <line x1="38" y1="10" x2="38" y2="54" />
      <line x1="10" y1="26" x2="54" y2="26" />
      <line x1="10" y1="38" x2="54" y2="38" />
      <g strokeWidth="3">
        <line x1="14" y1="14" x2="22" y2="22" />
        <line x1="22" y1="14" x2="14" y2="22" />
        <line x1="46" y1="42" x2="54" y2="50" />
        <line x1="54" y1="42" x2="46" y2="50" />
      </g>
      <circle cx="32" cy="32" r="4.5" strokeWidth="3" />
    </svg>
  );
}

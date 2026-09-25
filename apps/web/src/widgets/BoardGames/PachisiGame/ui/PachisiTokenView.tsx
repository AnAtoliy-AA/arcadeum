import type { ReactElement } from 'react';

interface PachisiTokenViewProps {
  seat: number;
  isMovable?: boolean;
  className?: string;
  ariaLabel?: string;
  onClick?: () => void;
  testId?: string;
  isButton?: boolean;
}

function CrownIcon(): ReactElement {
  return (
    <svg
      className="h-[60%] w-[60%] text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M5 18h14v2H5v-2zm0-2l-2-9 5.5 4 3.5-7 3.5 7 5.5-4-2 9H5z" />
    </svg>
  );
}

function StarIcon(): ReactElement {
  return (
    <svg
      className="h-[60%] w-[60%] text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2l2.4 6.6L21 11l-5.3 4.2L17.5 22 12 18.3 6.5 22l1.8-6.8L3 11l6.6-2.4L12 2z" />
    </svg>
  );
}

function GemIcon(): ReactElement {
  return (
    <svg
      className="h-[60%] w-[60%] text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M6 3h12l5 6-11 12L1 9l5-6zm2.2 2l-3.3 4h14.2l-3.3-4H8.2zM4.1 11l7.9 8.6 7.9-8.6H4.1z" />
    </svg>
  );
}

function ShieldIcon(): ReactElement {
  return (
    <svg
      className="h-[60%] w-[60%] text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 2.18l6 2.25v4.66c0 4.1-2.6 7.9-6 9-3.4-1.1-6-4.9-6-9V6.43l6-2.25z" />
    </svg>
  );
}

function SeatEmblem({ seat }: { seat: number }): ReactElement {
  const normalizedSeat = ((seat % 4) + 4) % 4;
  if (normalizedSeat === 0) return <CrownIcon />;
  if (normalizedSeat === 1) return <StarIcon />;
  if (normalizedSeat === 2) return <GemIcon />;
  return <ShieldIcon />;
}

export function PachisiTokenView({
  seat,
  isMovable = false,
  className = '',
  ariaLabel,
  onClick,
  testId,
  isButton = false,
}: PachisiTokenViewProps): ReactElement {
  const normalizedSeat = ((seat % 4) + 4) % 4;
  const seatTokenClass = `pachisi-token pachisi-token-seat-${normalizedSeat}`;

  const positionClass = className.includes('absolute') ? '' : 'relative';
  const baseClasses = `${seatTokenClass} aspect-square shrink-0 overflow-hidden rounded-full flex items-center justify-center ${positionClass} ${className}`;

  const innerContent = (
    <span className="pachisi-token-content pointer-events-none absolute inset-0 flex items-center justify-center">
      <span className="pachisi-token-gloss pointer-events-none absolute inset-x-1 top-0.5 h-[42%] rounded-t-full bg-gradient-to-b from-white/45 to-transparent" />
      <span className="pachisi-token-ridge pointer-events-none absolute inset-1 rounded-full border border-white/30" />
      <span className="relative z-10 flex h-full w-full items-center justify-center">
        <SeatEmblem seat={normalizedSeat} />
      </span>
    </span>
  );

  if (isButton) {
    return (
      <button
        type="button"
        aria-label={ariaLabel}
        data-testid={testId}
        onClick={onClick}
        className={`${baseClasses} transition-transform active:scale-95 ${
          isMovable
            ? 'animate-bounce cursor-pointer ring-2 ring-white shadow-[0_0_14px_rgba(255,255,255,0.85)] hover:scale-110'
            : ''
        }`}
      >
        {innerContent}
      </button>
    );
  }

  return (
    <span data-testid={testId} className={baseClasses}>
      {innerContent}
    </span>
  );
}

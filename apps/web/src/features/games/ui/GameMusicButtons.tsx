'use client';

export const VolumeIcon = ({ level }: { level: number }) => {
  if (level === 0) {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </svg>
    );
  }
  if (level < 0.5) {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
    );
  }
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
};

export const MusicBtn = ({
  onClick,
  testId,
  ariaLabel,
  color = 'rgba(255,255,255,0.7)',
  children,
  className = '',
}: {
  onClick: () => void;
  testId: string;
  ariaLabel: string;
  color?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    data-testid={testId}
    aria-label={ariaLabel}
    className={`game-music-btn ${className}`}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      border: '1px solid rgba(255,255,255,0.35)',
      background: 'rgba(255,255,255,0.15)',
      color,
      cursor: 'pointer',
      flexShrink: 0,
      boxShadow:
        'inset 0 1px 0 rgba(255,255,255,0.5), 0 1px 4px rgba(0,0,0,0.04)',
    }}
  >
    {children}
  </button>
);

export const PlayBtn = ({
  onClick,
  testId,
  ariaLabel,
  children,
}: {
  onClick: () => void;
  testId: string;
  ariaLabel: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    data-testid={testId}
    aria-label={ariaLabel}
    className="game-music-btn game-music-play-btn"
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      border: '1px solid rgba(255,255,255,0.45)',
      background: 'rgba(255,255,255,0.22)',
      color: 'rgba(255,255,255,0.9)',
      cursor: 'pointer',
      flexShrink: 0,
      boxShadow:
        'inset 0 1px 0 rgba(255,255,255,0.6), 0 2px 10px rgba(0,0,0,0.04)',
    }}
  >
    {children}
  </button>
);

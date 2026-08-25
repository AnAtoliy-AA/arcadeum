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
  title,
  color,
  isActive = false,
  children,
  className = '',
}: {
  onClick: () => void;
  testId: string;
  ariaLabel: string;
  title?: string;
  color?: string;
  isActive?: boolean;
  children: React.ReactNode;
  className?: string;
}) => {
  const active =
    isActive ||
    (color != null &&
      color !== 'rgba(255,255,255,0.4)' &&
      color !== 'rgba(255,255,255,0.3)');
  return (
    <button
      className={`game-music-btn ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        border: active
          ? '1px solid var(--primary, #818cf8)'
          : '1px solid var(--borderColor, rgba(255, 255, 255, 0.18))',
        background: `var(--gm-btn-bg, ${
          active
            ? 'color-mix(in srgb, var(--primary, #6366f1) 25%, transparent)'
            : 'color-mix(in srgb, var(--color, #fff) 8%, transparent)'
        })`,
        color:
          color ||
          (active
            ? 'var(--primary, #c7d2fe)'
            : 'var(--color, rgba(255, 255, 255, 0.75))'),
        cursor: 'pointer',
        flexShrink: 0,
        boxShadow: active
          ? '0 0 10px color-mix(in srgb, var(--primary, #6366f1) 35%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          : 'inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 2px 6px rgba(0, 0, 0, 0.2)',
      }}
      type="button"
      onClick={onClick}
      data-testid={testId}
      aria-label={ariaLabel}
      title={title || ariaLabel}
    >
      {children}
    </button>
  );
};

export const PlayBtn = ({
  onClick,
  testId,
  ariaLabel,
  title,
  children,
}: {
  onClick: () => void;
  testId: string;
  ariaLabel: string;
  title?: string;
  children: React.ReactNode;
}) => (
  <button
    className="game-music-btn game-music-play-btn"
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      border:
        '1px solid color-mix(in srgb, var(--primaryText, #fff) 30%, var(--primary, #6366f1))',
      background:
        'var(--gm-play-bg, linear-gradient(135deg, var(--primaryGradientStart, var(--primary, #6366f1)), var(--primaryGradientEnd, var(--secondary, #4f46e5))))',
      color: 'var(--primaryText, #ffffff)',
      cursor: 'pointer',
      flexShrink: 0,
      boxShadow:
        'inset 0 1px 0 rgba(255,255,255,0.4), 0 4px 14px color-mix(in srgb, var(--primary, #6366f1) 45%, transparent)',
    }}
    type="button"
    onClick={onClick}
    data-testid={testId}
    aria-label={ariaLabel}
    title={title || ariaLabel}
  >
    {children}
  </button>
);

'use client';

/**
 * Coach-mode "💡 Hint" trigger. Renders the button plus, when a hint has been
 * generated, a short localized explanation of the suggested move beneath it.
 */
export interface HintButtonProps {
  /** Translated button label (e.g. "Hint"). */
  label: string;
  /** Translated explanation of the current suggestion, if any. */
  hint: string | null;
  disabled?: boolean;
  onClick: () => void;
}

export function HintButton({
  label,
  hint,
  disabled = false,
  onClick,
}: HintButtonProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        data-testid="coach-hint-button"
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: 6,
          backgroundColor: 'rgba(167, 139, 250, 0.15)',
          border: '1px solid rgba(167, 139, 250, 0.35)',
          color: '#c4b5fd',
          fontSize: 12,
          fontWeight: 600,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        💡 {label}
      </button>
      {hint ? (
        <div
          data-testid="coach-hint-text"
          role="status"
          style={{
            padding: '8px 10px',
            borderRadius: 8,
            backgroundColor: 'rgba(167, 139, 250, 0.1)',
            border: '1px solid rgba(167, 139, 250, 0.25)',
            color: '#ddd6fe',
            fontSize: 12,
            lineHeight: 1.5,
          }}
        >
          {hint}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Renders the 7-day stamp row. Each stamp shows the day index (1..7) and
 * uses one of three visual states:
 *
 *   - `claimed`  — the user has already credited this day in the current streak
 *   - `active`   — the day the next successful claim will award (only when canClaim)
 *   - `locked`   — a future day the user has not reached yet
 *
 * Pure presentational, no I/O — safe to render in a Server Component.
 */

export interface StampRowProps {
  /** The streak day (1..7) the next claim will award. */
  nextDay: number;
  /** Day of the user's most recent successful claim. 0 if none. */
  currentStreak: number;
  /** True when the user has not yet claimed today. */
  canClaim: boolean;
  /** Per-day label for the "Day N" copy ("Day {n}"). */
  dayLabel: string;
}

type StampState = 'claimed' | 'active' | 'locked';

function getStampState(
  day: number,
  currentStreak: number,
  nextDay: number,
  canClaim: boolean,
): StampState {
  if (day <= currentStreak) return 'claimed';
  if (canClaim && day === nextDay) return 'active';
  return 'locked';
}

function stampStyles(state: StampState): React.CSSProperties {
  if (state === 'claimed') {
    return {
      background: 'rgba(34,197,94,0.15)',
      border: '1px solid rgba(34,197,94,0.4)',
      color: '#22c55e',
    };
  }
  if (state === 'active') {
    return {
      background: 'rgba(251,191,36,0.18)',
      border: '1px solid rgba(251,191,36,0.55)',
      color: '#fbbf24',
      boxShadow: '0 0 0 2px rgba(251,191,36,0.15)',
    };
  }
  return {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#52525b',
  };
}

export function StampRow({
  nextDay,
  currentStreak,
  canClaim,
  dayLabel,
}: StampRowProps) {
  const days = [1, 2, 3, 4, 5, 6, 7] as const;

  return (
    <div
      data-testid="daily-reward-stamp-row"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
        gap: '6px',
        width: '100%',
      }}
    >
      {days.map((day) => {
        const state = getStampState(day, currentStreak, nextDay, canClaim);
        return (
          <div
            key={day}
            data-testid={`daily-reward-stamp-${day}`}
            data-state={state}
            aria-label={dayLabel.replace('{n}', String(day))}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              padding: '8px 4px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 600,
              ...stampStyles(state),
            }}
          >
            <span style={{ fontSize: '14px', lineHeight: 1 }}>
              {state === 'claimed' ? '✓' : day}
            </span>
            <span
              style={{
                fontSize: '9px',
                fontWeight: 500,
                opacity: 0.7,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {dayLabel.replace('{n}', String(day))}
            </span>
            {day === 7 && (
              <span
                aria-hidden
                data-testid="daily-reward-stamp-7-gem"
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-4px',
                  fontSize: '12px',
                  lineHeight: 1,
                  filter:
                    state === 'locked'
                      ? 'grayscale(0.7) opacity(0.5)'
                      : 'none',
                }}
              >
                💎
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

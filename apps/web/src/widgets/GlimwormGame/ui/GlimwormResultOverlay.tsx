'use client';

import { useGlimwormStore } from '../store/glimwormStore';

interface GlimwormResultOverlayProps {
  isHost: boolean;
  onRematch: () => void;
}

/**
 * Shown when snapshot.status === 'ended'. Displays the round outcome
 * (victory / defeat / tie), a small scoreboard, and a Rematch button for
 * the host. Guests see a passive "Waiting for host..." note instead.
 */
export function GlimwormResultOverlay({
  isHost,
  onRematch,
}: GlimwormResultOverlayProps): React.JSX.Element | null {
  const snapshot = useGlimwormStore((s) => s.latestSnapshot);
  if (!snapshot || snapshot.status !== 'ended') return null;

  const self = snapshot.worms.find((w) => w.self);
  const winnerWorm = snapshot.winner
    ? snapshot.worms.find((w) => w.id === snapshot.winner)
    : null;

  const result: 'victory' | 'defeat' | 'tie' =
    snapshot.winner === null
      ? 'tie'
      : self && self.id === snapshot.winner
        ? 'victory'
        : 'defeat';

  const sortedWorms = [...snapshot.worms].sort((a, b) => b.score - a.score);

  const headline =
    result === 'victory'
      ? '🏆 Victory!'
      : result === 'tie'
        ? "🤝 It's a tie"
        : '☠ Defeated';
  const sub =
    result === 'victory'
      ? 'You outlasted the field.'
      : result === 'tie'
        ? 'No-one came out on top.'
        : winnerWorm
          ? `${winnerWorm.color} worm won the round.`
          : 'Better luck next round.';

  const accent =
    result === 'victory'
      ? 'linear-gradient(135deg, #ffd05e 0%, #ff5e9c 100%)'
      : result === 'tie'
        ? 'linear-gradient(135deg, #5ee0ff 0%, #7c5cff 100%)'
        : 'linear-gradient(135deg, #ff5e5e 0%, #b15eff 100%)';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(10px)',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 460,
          width: '90%',
          padding: 28,
          borderRadius: 16,
          background: 'rgba(20, 22, 40, 0.95)',
          border: '1px solid rgba(255,255,255,0.10)',
          color: '#fff',
          textAlign: 'center',
          boxShadow: '0 20px 80px rgba(0,0,0,0.5)',
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontWeight: 800,
            background: accent,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 6,
          }}
        >
          {headline}
        </div>
        <div
          style={{
            fontSize: 14,
            color: 'rgba(203,213,225,0.85)',
            marginBottom: 22,
          }}
        >
          {sub}
        </div>

        <div
          style={{
            textAlign: 'left',
            marginBottom: 22,
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          {sortedWorms.map((w, i) => {
            const isSelf = !!w.self;
            return (
              <div
                key={w.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  background: isSelf
                    ? 'rgba(124,255,94,0.08)'
                    : i % 2 === 0
                      ? 'rgba(255,255,255,0.02)'
                      : 'transparent',
                }}
              >
                <span
                  style={{
                    width: 22,
                    color: 'rgba(148,163,184,0.7)',
                    fontSize: 12,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {i + 1}.
                </span>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: w.color,
                    boxShadow: `0 0 10px ${w.color}`,
                  }}
                />
                <span style={{ flex: 1, fontSize: 14 }}>
                  {isSelf ? 'You' : w.color}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontVariantNumeric: 'tabular-nums',
                    color: '#a0e8ff',
                    fontWeight: 600,
                  }}
                >
                  {w.score}
                </span>
              </div>
            );
          })}
        </div>

        {isHost ? (
          <button
            type="button"
            onClick={onRematch}
            style={{
              padding: '12px 28px',
              borderRadius: 8,
              background: 'linear-gradient(135deg, #5ee0ff 0%, #7c5cff 100%)',
              color: '#fff',
              border: 0,
              cursor: 'pointer',
              fontSize: 15,
              fontWeight: 700,
              fontFamily: 'inherit',
              boxShadow: '0 6px 20px rgba(124,92,255,0.4)',
            }}
          >
            ↻ Rematch
          </button>
        ) : (
          <div
            style={{
              fontSize: 13,
              color: 'rgba(203,213,225,0.65)',
              fontStyle: 'italic',
            }}
          >
            Waiting for host to start a rematch…
          </div>
        )}
      </div>
    </div>
  );
}

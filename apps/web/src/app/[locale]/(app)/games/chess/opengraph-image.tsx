import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Chess — free multiplayer on Arcadeum';

const BOARD: Array<Array<string | null>> = [
  ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
  ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, '♟', null, null, null, null],
  [null, null, null, null, null, '♙', null, null],
  [null, null, null, null, null, null, null, null],
  ['♙', '♙', '♙', '♙', null, '♙', '♙', '♙'],
  ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'],
];

function isBlackPiece(p: string | null): boolean {
  if (!p) return false;
  return '♜♞♝♛♚♟'.includes(p);
}

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 80px',
        background:
          'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        color: 'white',
        fontFamily: 'system-ui, sans-serif',
        position: 'relative',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          right: -80,
          top: -80,
          width: 400,
          height: 400,
          borderRadius: 200,
          background:
            'radial-gradient(circle, rgba(167, 139, 250, 0.2) 0%, transparent 60%)',
        }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
          maxWidth: 560,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ fontSize: 22, opacity: 0.7, letterSpacing: '2px' }}>
          ARCADEUM
        </div>
        <div
          style={{
            fontSize: 84,
            fontWeight: 900,
            lineHeight: 1,
            display: 'flex',
          }}
        >
          Chess
        </div>
        <div
          style={{
            fontSize: 30,
            opacity: 0.9,
            lineHeight: 1.3,
            display: 'flex',
          }}
        >
          Multiplayer · Standard &amp; Chess960 · Time controls
        </div>
        <div
          style={{
            display: 'flex',
            gap: 12,
            fontSize: 18,
            flexWrap: 'wrap',
            opacity: 0.95,
          }}
        >
          <span
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.12)',
            }}
          >
            2 players
          </span>
          <span
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.12)',
            }}
          >
            Bots day one
          </span>
          <span
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.12)',
            }}
          >
            Time controls
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: 16,
          background: 'rgba(255, 255, 255, 0.06)',
          borderRadius: 24,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {BOARD.map((row, ri) => (
          <div key={ri} style={{ display: 'flex' }}>
            {row.map((cell, ci) => {
              const isLight = (ri + ci) % 2 === 0;
              return (
                <div
                  key={ci}
                  style={{
                    width: 42,
                    height: 42,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    background: isLight
                      ? 'rgba(240, 217, 181, 0.25)'
                      : 'rgba(181, 136, 99, 0.35)',
                    color: cell && isBlackPiece(cell) ? '#1a1a2e' : '#f0d9b5',
                  }}
                >
                  {cell ?? ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>,
    { ...size },
  );
}

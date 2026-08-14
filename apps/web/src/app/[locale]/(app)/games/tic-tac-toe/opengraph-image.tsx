import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Tic-Tac-Toe — free multiplayer with 3×3 – 9×9 boards';

const BOARD: Array<Array<'x' | 'o' | null>> = [
  ['x', null, 'o'],
  [null, 'x', null],
  ['o', null, 'x'],
];

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
          right: -60,
          top: -60,
          width: 360,
          height: 360,
          borderRadius: 180,
          background:
            'radial-gradient(circle, rgba(96, 165, 250, 0.15) 0%, transparent 60%)',
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
        <div style={{ fontSize: 22, opacity: 0.7, letterSpacing: 2 }}>
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
          Tic-Tac-Toe
        </div>
        <div
          style={{
            fontSize: 30,
            opacity: 0.9,
            lineHeight: 1.3,
            display: 'flex',
          }}
        >
          Multiplayer · themed boards · 3×3 – 9×9
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
            2–5 players
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
            Six themes
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: 24,
          background: 'rgba(255, 255, 255, 0.06)',
          borderRadius: 24,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {BOARD.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 8 }}>
            {row.map((cell, ci) => (
              <div
                key={ci}
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: 18,
                  background: cell
                    ? cell === 'x'
                      ? 'rgba(251, 113, 133, 0.2)'
                      : 'rgba(96, 165, 250, 0.2)'
                    : 'rgba(0, 0, 0, 0.25)',
                  border: cell
                    ? cell === 'x'
                      ? '2px solid rgba(251, 113, 133, 0.4)'
                      : '2px solid rgba(96, 165, 250, 0.4)'
                    : '2px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 72,
                  fontWeight: 800,
                  color:
                    cell === 'x'
                      ? '#fb7185'
                      : cell === 'o'
                        ? '#60a5fa'
                        : 'transparent',
                  boxShadow: cell
                    ? cell === 'x'
                      ? '0 0 20px rgba(251, 113, 133, 0.3)'
                      : '0 0 20px rgba(96, 165, 250, 0.3)'
                    : 'none',
                }}
              >
                {cell === 'x' ? '✕' : cell === 'o' ? '○' : ''}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>,
    { ...size },
  );
}

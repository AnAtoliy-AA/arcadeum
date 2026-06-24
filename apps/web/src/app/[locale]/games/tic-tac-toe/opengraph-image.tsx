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
    (
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
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 32,
            maxWidth: 560,
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
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            padding: 24,
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 28,
            width: 360,
            height: 360,
          }}
        >
          {BOARD.flat().map((cell, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(0, 0, 0, 0.35)',
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 80,
                fontWeight: 800,
                color:
                  cell === 'x'
                    ? '#fb7185'
                    : cell === 'o'
                      ? '#60a5fa'
                      : 'transparent',
              }}
            >
              {cell === 'x' ? '✕' : cell === 'o' ? '○' : ' '}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}

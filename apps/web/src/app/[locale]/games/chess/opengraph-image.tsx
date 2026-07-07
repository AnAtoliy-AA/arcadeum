import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Chess — free multiplayer on Arcadeum';

const PIECES = [
  { symbol: '♜', color: '#b58863' },
  { symbol: '♞', color: '#b58863' },
  { symbol: '♝', color: '#b58863' },
  { symbol: '♛', color: '#b58863' },
  { symbol: '♚', color: '#b58863' },
  { symbol: '♝', color: '#b58863' },
  { symbol: '♞', color: '#b58863' },
  { symbol: '♜', color: '#b58863' },
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
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gap: 4,
            padding: 20,
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 28,
            width: 360,
            height: 360,
          }}
        >
          {PIECES.map((p, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(0, 0, 0, 0.35)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 40,
                color: '#f0d9b5',
              }}
            >
              {p.symbol}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}

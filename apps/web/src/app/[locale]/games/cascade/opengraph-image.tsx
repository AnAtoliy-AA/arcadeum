import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt =
  'Cascade — multiplayer shedding card game with stacking penalty chains';

const FAN = [
  { color: '#dc2626', label: '7', rotate: -18, dx: -180 },
  { color: '#fbbf24', label: '+2', rotate: -6, dx: -60 },
  { color: '#3b82f6', label: '↻', rotate: 6, dx: 60 },
  { color: '#10b981', label: '★', rotate: 18, dx: 180 },
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
            'radial-gradient(circle at 30% 30%, #312e81 0%, #0c0a1e 70%, #050314 100%)',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 32,
            maxWidth: 540,
          }}
        >
          <div style={{ fontSize: 22, opacity: 0.7, letterSpacing: 2 }}>
            ARCADEUM
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              lineHeight: 1,
              display: 'flex',
            }}
          >
            Cascade
          </div>
          <div
            style={{
              fontSize: 28,
              opacity: 0.9,
              lineHeight: 1.3,
              display: 'flex',
            }}
          >
            Match by color or number · stack the chain · empty your hand
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
              2–10 players
            </span>
            <span
              style={{
                padding: '8px 16px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.12)',
              }}
            >
              8 themes
            </span>
            <span
              style={{
                padding: '8px 16px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.12)',
              }}
            >
              Stacking chains
            </span>
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            width: 440,
            height: 440,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {FAN.map((c, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: 160,
                height: 240,
                background: c.color,
                borderRadius: 22,
                border: '4px solid rgba(255,255,255,0.18)',
                boxShadow: '0 18px 36px rgba(0,0,0,0.45)',
                transform: `translate(${c.dx}px, 0) rotate(${c.rotate}deg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 88,
                fontWeight: 900,
                color: 'white',
              }}
            >
              {c.label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}

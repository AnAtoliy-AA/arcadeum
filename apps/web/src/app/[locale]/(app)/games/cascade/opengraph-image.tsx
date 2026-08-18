import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt =
  'Cascade — multiplayer shedding card game with stacking penalty chains';

const FAN = [
  { color: '#dc2626', label: '7', rotate: -22, dx: -160, dy: 20 },
  { color: '#fbbf24', label: '+2', rotate: -8, dx: -55, dy: -10 },
  { color: '#3b82f6', label: '↻', rotate: 6, dx: 55, dy: -5 },
  { color: '#10b981', label: '★', rotate: 20, dx: 165, dy: 15 },
  { color: '#8b5cf6', label: '3', rotate: 32, dx: 250, dy: 40 },
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
          'radial-gradient(circle at 30% 30%, #312e81 0%, #0c0a1e 70%, #050314 100%)',
        color: 'white',
        fontFamily: 'system-ui, sans-serif',
        position: 'relative',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          right: 20,
          top: 40,
          width: 500,
          height: 500,
          borderRadius: 250,
          background:
            'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 60%)',
        }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
          maxWidth: 540,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ fontSize: 22, opacity: 0.7, letterSpacing: '2px' }}>
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
          width: 480,
          height: 420,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        {/* Card stack shadow */}
        <div
          style={{
            position: 'absolute',
            left: 80,
            top: 100,
            width: 200,
            height: 300,
            borderRadius: 24,
            background: 'rgba(0, 0, 0, 0.3)',
            filter: 'blur(20px)',
          }}
        />

        {FAN.map((c, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `calc(50% + ${c.dx}px - 70px)`,
              top: `calc(50% + ${c.dy}px - 105px)`,
              width: 140,
              height: 210,
              background: `linear-gradient(145deg, ${c.color} 0%, ${c.color}cc 100%)`,
              borderRadius: 20,
              border: '3px solid rgba(255,255,255,0.2)',
              boxShadow: `0 14px 40px rgba(0,0,0,0.5), 0 0 24px ${c.color}33`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 72,
              fontWeight: 900,
              color: 'white',
              transform: `rotate(${c.rotate}deg)`,
            }}
          >
            {c.label}
          </div>
        ))}
      </div>
    </div>,
    { ...size },
  );
}

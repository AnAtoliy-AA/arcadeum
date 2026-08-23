import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Pachisi — free multiplayer race board game';

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
          'linear-gradient(135deg, #0f172a 0%, #7c2d12 50%, #b45309 100%)',
        color: 'white',
        fontFamily: 'system-ui, sans-serif',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          maxWidth: 600,
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
            background: 'linear-gradient(135deg, #ffffff 0%, #fed7aa 100%)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Pachisi
        </div>
        <div style={{ fontSize: 24, opacity: 0.85, lineHeight: 1.4 }}>
          Classic cross-and-circle race game — roll a six, capture rivals, and
          bring all your tokens home.
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          <div
            style={{
              padding: '10px 24px',
              borderRadius: 12,
              background: '#d97706',
              fontWeight: 'bold',
              fontSize: 18,
            }}
          >
            Play Free Online
          </div>
        </div>
      </div>

      <div
        style={{
          width: 360,
          height: 360,
          borderRadius: 24,
          border: '2px solid rgba(253, 186, 116, 0.3)',
          background: 'rgba(69, 26, 3, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
        }}
      >
        <div style={{ fontSize: 80 }}>🎲</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#ffedd5' }}>
          2–4 Players · Race
        </div>
      </div>
    </div>,
    { ...size },
  );
}

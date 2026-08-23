import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Hearts — free multiplayer card game';

function HeartsArtwork() {
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
          'linear-gradient(135deg, #0f172a 0%, #4c0519 50%, #881337 100%)',
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
          maxWidth: 620,
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
            background: 'linear-gradient(135deg, #ffffff 0%, #fda4af 100%)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Hearts
        </div>
        <div style={{ fontSize: 24, opacity: 0.85, lineHeight: 1.4 }}>
          Classic 4-player trick-taking game with card passing, the Queen of
          Spades, and shooting the moon.
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          <div
            style={{
              padding: '10px 24px',
              borderRadius: 12,
              background: '#dc2626',
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
          border: '2px solid rgba(253, 164, 175, 0.3)',
          background: 'rgba(30, 27, 75, 0.55)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
        }}
      >
        <div style={{ fontSize: 84, color: '#f87171' }}>♥</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#ffe4e6' }}>
          4 Players · Trick-Taking
        </div>
      </div>
    </div>,
    { ...size },
  );
}

export default HeartsArtwork;

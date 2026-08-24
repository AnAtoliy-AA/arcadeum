import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Spades — free multiplayer card game';

function SpadesArtwork() {
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
          'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)',
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
            background: 'linear-gradient(135deg, #ffffff 0%, #93c5fd 100%)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Spades
        </div>
        <div style={{ fontSize: 24, opacity: 0.85, lineHeight: 1.4 }}>
          Classic 4-player partnership game with bidding, nil bids, and the
          sandbag penalty.
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          <div
            style={{
              padding: '10px 24px',
              borderRadius: 12,
              background: '#1d4ed8',
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
          border: '2px solid rgba(147, 197, 253, 0.3)',
          background: 'rgba(30, 27, 75, 0.55)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
        }}
      >
        <div style={{ fontSize: 84, color: '#bfdbfe' }}>♠</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#dbeafe' }}>
          4 Players · 2v2 Teams
        </div>
      </div>
    </div>,
    { ...size },
  );
}

export default SpadesArtwork;

import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Go — free multiplayer board game';

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
          'linear-gradient(135deg, #0f172a 0%, #3b0764 50%, #581c87 100%)',
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
            fontSize: 96,
            fontWeight: 900,
            lineHeight: 1,
            background: 'linear-gradient(135deg, #ffffff 0%, #d8b4fe 100%)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Go
        </div>
        <div style={{ fontSize: 24, opacity: 0.85, lineHeight: 1.4 }}>
          The ancient game of territory. Captures, ko rule, and AI opponents on
          9×9 to 19×19 boards.
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          <div
            style={{
              padding: '10px 24px',
              borderRadius: 12,
              background: '#9333ea',
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
          border: '2px solid rgba(216, 180, 254, 0.3)',
          background: 'rgba(30, 27, 75, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', gap: 12 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 999,
              background: '#111318',
              border: '2px solid rgba(255,255,255,0.25)',
            }}
          />
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 999,
              background: '#f4f5f7',
              border: '2px solid rgba(0,0,0,0.4)',
              marginTop: 36,
            }}
          />
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#f3e8ff' }}>
          ⚫⚪ 2 Players · Classic
        </div>
      </div>
    </div>,
    { ...size },
  );
}

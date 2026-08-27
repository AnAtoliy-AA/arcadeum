import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Solitaire — free online Klondike card game on Arcadeum';

interface FanCard {
  rank: string;
  suit: string;
  red: boolean;
  offsetTop: number;
}

const FAN: FanCard[] = [
  { rank: 'Q', suit: '♦', red: true, offsetTop: 0 },
  { rank: 'K', suit: '♥', red: true, offsetTop: 28 },
  { rank: 'A', suit: '♠', red: false, offsetTop: 56 },
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
          width: 380,
          height: 380,
          borderRadius: 190,
          background:
            'radial-gradient(circle, rgba(251, 113, 133, 0.18) 0%, transparent 60%)',
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
          Solitaire
        </div>
        <div
          style={{
            fontSize: 30,
            opacity: 0.9,
            lineHeight: 1.3,
            display: 'flex',
          }}
        >
          Classic Klondike · plays instantly in your browser
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
            Single-player
          </span>
          <span
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.12)',
            }}
          >
            No signup
          </span>
          <span
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.12)',
            }}
          >
            Free forever
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          padding: '24px 32px 56px',
          background: 'rgba(255, 255, 255, 0.06)',
          borderRadius: 24,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {FAN.map((card) => (
          <div
            key={card.suit}
            style={{
              width: 150,
              height: 210,
              marginTop: card.offsetTop,
              marginLeft: card === FAN[0] ? 0 : -40,
              background: '#f8fafc',
              borderRadius: 16,
              border: '1px solid rgba(15, 23, 42, 0.2)',
              boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
              color: card.red ? '#dc2626' : '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 10,
                left: 14,
                display: 'flex',
                fontSize: 26,
                fontWeight: 800,
              }}
            >
              {card.rank}
            </div>
            <div style={{ fontSize: 72, display: 'flex' }}>{card.suit}</div>
            <div
              style={{
                position: 'absolute',
                bottom: 10,
                right: 14,
                display: 'flex',
                fontSize: 26,
                fontWeight: 800,
                transform: 'rotate(180deg)',
              }}
            >
              {card.rank}
            </div>
          </div>
        ))}
      </div>
    </div>,
    { ...size },
  );
}

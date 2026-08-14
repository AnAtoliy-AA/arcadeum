import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Checkers — free multiplayer board game';

const CELL = 52;
const GAP = 3;

function drawBoard() {
  const cells: React.ReactElement[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const isLight = (r + c) % 2 === 0;
      const hasPiece = (r < 3 && !isLight) || (r >= 5 && !isLight);
      const isLightPiece = r >= 5 && !isLight;
      cells.push(
        <div
          key={`${r}-${c}`}
          style={{
            width: CELL,
            height: CELL,
            borderRadius: 6,
            background: isLight
              ? 'rgba(245, 245, 244, 0.12)'
              : 'rgba(87, 83, 78, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {hasPiece ? (
            <div
              style={{
                width: CELL * 0.65,
                height: CELL * 0.65,
                borderRadius: '50%',
                background: isLightPiece
                  ? 'rgba(250, 250, 249, 0.9)'
                  : 'rgba(41, 37, 36, 0.9)',
                border: `2px solid ${isLightPiece ? 'rgba(168,162,158,0.4)' : 'rgba(28,25,23,0.4)'}`,
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              }}
            />
          ) : null}
        </div>,
      );
    }
  }
  return cells;
}

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
      <div
        style={{
          position: 'absolute',
          right: -60,
          top: -60,
          width: 360,
          height: 360,
          borderRadius: 180,
          background:
            'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 60%)',
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
          Checkers
        </div>
        <div
          style={{
            fontSize: 30,
            opacity: 0.9,
            lineHeight: 1.3,
            display: 'flex',
          }}
        >
          Classic 8×8 · forced captures · king promotion
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
            Five themes
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(8, ${CELL}px)`,
          gap: GAP,
          padding: 20,
          background: 'rgba(255, 255, 255, 0.06)',
          borderRadius: 24,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {drawBoard()}
      </div>
    </div>,
    { ...size },
  );
}

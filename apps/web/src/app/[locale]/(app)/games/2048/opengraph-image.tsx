import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = '2048 — free online tile-merging puzzle on Arcadeum';

interface Tile {
  value: number;
  background: string;
  color: string;
}

/** Classic 2048 tile palette. */
const TILES: Tile[] = [
  { value: 2, background: '#eee4da', color: '#776e65' },
  { value: 4, background: '#ede0c8', color: '#776e65' },
  { value: 8, background: '#f2b179', color: '#f9f6f2' },
  { value: 16, background: '#f59563', color: '#f9f6f2' },
];

const ACCENT = '#fbbf24';

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
            'radial-gradient(circle, rgba(251, 191, 36, 0.16) 0%, transparent 60%)',
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
            fontSize: 96,
            fontWeight: 900,
            lineHeight: 1,
            display: 'flex',
            color: ACCENT,
          }}
        >
          2048
        </div>
        <div
          style={{
            fontSize: 30,
            opacity: 0.9,
            lineHeight: 1.3,
            display: 'flex',
          }}
        >
          Slide &amp; merge equal tiles — how far can you go?
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
          flexDirection: 'column',
          gap: 14,
          padding: 24,
          background: 'rgba(255, 255, 255, 0.06)',
          borderRadius: 24,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {[TILES.slice(0, 2), TILES.slice(2, 4)].map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 14 }}>
            {row.map((tile) => (
              <div
                key={tile.value}
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: 20,
                  background: tile.background,
                  color: tile.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: tile.value > 9 ? 64 : 76,
                  fontWeight: 900,
                  boxShadow: '0 10px 26px rgba(0,0,0,0.35)',
                }}
              >
                {tile.value}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>,
    { ...size },
  );
}

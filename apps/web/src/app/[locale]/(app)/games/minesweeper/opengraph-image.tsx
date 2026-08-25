import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Minesweeper — free online logic puzzle on Arcadeum';

/** Cell states: number (revealed), flag, mine, or hidden. */
type Cell =
  | { kind: 'num'; n: number }
  | { kind: 'flag' }
  | { kind: 'mine' }
  | { kind: 'hidden' };

const BOARD: Cell[][] = [
  [
    { kind: 'hidden' },
    { kind: 'num', n: 1 },
    { kind: 'hidden' },
    { kind: 'num', n: 1 },
  ],
  [
    { kind: 'flag' },
    { kind: 'num', n: 2 },
    { kind: 'hidden' },
    { kind: 'num', n: 1 },
  ],
  [
    { kind: 'num', n: 1 },
    { kind: 'num', n: 1 },
    { kind: 'num', n: 2 },
    { kind: 'mine' },
  ],
];

const NUM_COLORS: Record<number, string> = {
  1: '#60a5fa',
  2: '#34d399',
};

function cellStyle(cell: Cell): {
  background: string;
  border: string;
} {
  switch (cell.kind) {
    case 'mine':
      return {
        background: 'rgba(248, 113, 113, 0.22)',
        border: '2px solid rgba(248, 113, 113, 0.45)',
      };
    case 'flag':
      return {
        background: 'rgba(251, 191, 36, 0.18)',
        border: '2px solid rgba(251, 191, 36, 0.4)',
      };
    case 'num':
      return {
        background: 'rgba(255, 255, 255, 0.08)',
        border: '2px solid rgba(255, 255, 255, 0.12)',
      };
    default:
      return {
        background: 'rgba(0, 0, 0, 0.3)',
        border: '2px solid rgba(255, 255, 255, 0.06)',
      };
  }
}

function cellGlyph(cell: Cell): { text: string; color: string; size: number } {
  switch (cell.kind) {
    case 'mine':
      return { text: '●', color: '#f87171', size: 44 };
    case 'flag':
      return { text: '⚑', color: '#fbbf24', size: 48 };
    case 'num':
      return {
        text: String(cell.n),
        color: NUM_COLORS[cell.n] ?? '#e2e8f0',
        size: 52,
      };
    default:
      return { text: '', color: 'transparent', size: 52 };
  }
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
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          right: -70,
          top: -70,
          width: 380,
          height: 380,
          borderRadius: 190,
          background:
            'radial-gradient(circle, rgba(248, 113, 113, 0.16) 0%, transparent 60%)',
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
          Minesweeper
        </div>
        <div
          style={{
            fontSize: 30,
            opacity: 0.9,
            lineHeight: 1.3,
            display: 'flex',
          }}
        >
          Classic logic puzzle · beginner to expert grids
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
          padding: 20,
          background: 'rgba(255, 255, 255, 0.06)',
          borderRadius: 24,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {BOARD.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 8 }}>
            {row.map((cell, ci) => {
              const glyph = cellGlyph(cell);
              const style = cellStyle(cell);
              return (
                <div
                  key={ci}
                  style={{
                    width: 104,
                    height: 104,
                    borderRadius: 16,
                    ...style,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: glyph.size,
                    fontWeight: 800,
                    color: glyph.color,
                  }}
                >
                  {glyph.text}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>,
    { ...size },
  );
}

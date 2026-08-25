import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt =
  'Sudoku — free online puzzles with unique solutions on Arcadeum';

const BOARD: number[][] = [
  [5, 3, 0, 0],
  [6, 0, 0, 9],
  [0, 9, 8, 0],
  [4, 0, 0, 1],
];

const ACCENT = '#a78bfa';

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
          width: 360,
          height: 360,
          borderRadius: 180,
          background:
            'radial-gradient(circle, rgba(167, 139, 250, 0.18) 0%, transparent 60%)',
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
          Sudoku
        </div>
        <div
          style={{
            fontSize: 30,
            opacity: 0.9,
            lineHeight: 1.3,
            display: 'flex',
          }}
        >
          Unique-solution puzzles · easy, medium &amp; hard · pencil marks
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
          padding: 12,
          background: 'rgba(255, 255, 255, 0.06)',
          borderRadius: 24,
          border: `2px solid ${ACCENT}55`,
          boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {BOARD.map((row, ri) => (
          <div key={ri} style={{ display: 'flex' }}>
            {row.map((n, ci) => {
              // Thicker separators through the middle of the 4×4 board to
              // suggest the classic sub-grid structure of a sudoku puzzle.
              const midRight = ci === 1;
              const midBottom = ri === 1;
              return (
                <div
                  key={ci}
                  style={{
                    width: 104,
                    height: 104,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 56,
                    fontWeight: 800,
                    color: n ? '#f1f5f9' : 'rgba(255,255,255,0.15)',
                    borderRight: midRight
                      ? `3px solid ${ACCENT}aa`
                      : '1px solid rgba(255,255,255,0.08)',
                    borderBottom: midBottom
                      ? `3px solid ${ACCENT}aa`
                      : '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {n || '·'}
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

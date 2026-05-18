import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Sea Battle — free online Battleship on Arcadeum';

const CELL = 36;
const ROWS = 10;
const COLS = 10;

// The target cell is where the "active strike" happens — sonar rings
// emanate from here and the cell itself glows.
const TARGET = { col: 7, row: 4 };

type ShipPlacement = {
  col: number;
  row: number;
  len: number;
  horiz: boolean;
  hits: number;
};

const SHIPS: ShipPlacement[] = [
  { col: 1, row: 1, len: 5, horiz: true, hits: 2 },
  { col: 7, row: 2, len: 4, horiz: false, hits: 2 },
  { col: 3, row: 5, len: 3, horiz: true, hits: 3 },
  { col: 1, row: 7, len: 3, horiz: false, hits: 0 },
  { col: 6, row: 8, len: 2, horiz: true, hits: 2 },
];

const MISSES: Array<{ c: number; r: number }> = [
  { c: 5, r: 0 },
  { c: 9, r: 0 },
  { c: 2, r: 4 },
  { c: 6, r: 6 },
  { c: 4, r: 9 },
  { c: 0, r: 3 },
];

function cellState(col: number, row: number) {
  for (const s of SHIPS) {
    for (let i = 0; i < s.len; i++) {
      const sc = s.horiz ? s.col + i : s.col;
      const sr = s.horiz ? s.row : s.row + i;
      if (sc === col && sr === row) {
        return i < s.hits ? 'hit' : 'ship';
      }
    }
  }
  if (MISSES.some((m) => m.c === col && m.r === row)) return 'miss';
  return 'empty';
}

const CELL_BG: Record<string, string> = {
  hit: '#ef4444',
  ship: 'rgba(255, 149, 0, 0.62)',
  miss: 'rgba(180, 210, 240, 0.14)',
  empty: 'rgba(120, 180, 230, 0.04)',
};

export function renderSeaBattleOgImage(): ImageResponse {
  const BOARD_PAD = 18;
  const targetX = BOARD_PAD + TARGET.col * CELL + CELL / 2;
  const targetY = BOARD_PAD + TARGET.row * CELL + CELL / 2;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          // Vertical ocean-depth gradient (single background for satori).
          backgroundImage:
            'linear-gradient(180deg, #0f2543 0%, #0a1a32 32%, #061224 72%, #03091a 100%)',
          padding: '56px 72px',
          color: 'white',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        {/* Atmospheric glow above horizon */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: 220,
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(95, 170, 225, 0.22) 0%, transparent 70%)',
          }}
        />
        {/* Horizon line */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 188,
            width: '100%',
            height: 1,
            background:
              'linear-gradient(90deg, transparent 0%, rgba(180, 220, 250, 0.45) 50%, transparent 100%)',
          }}
        />

        {/* LEFT — copy column */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 24,
              letterSpacing: 6,
              color: '#ff9500',
              fontWeight: 700,
              marginBottom: 18,
            }}
          >
            PLAY FREE · NO SIGNUP
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 108,
              lineHeight: 1,
              fontWeight: 900,
              color: 'white',
              marginBottom: 26,
              letterSpacing: -3,
              whiteSpace: 'nowrap',
            }}
          >
            Sea Battle
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 30,
              color: '#b6cee6',
              lineHeight: 1.35,
              maxWidth: 540,
            }}
          >
            Multiplayer Battleship in your browser. 2–4 players, AI bots, 10+
            themes.
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: 44,
              gap: 12,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                background: '#ff9500',
                boxShadow: '0 0 16px rgba(255, 149, 0, 0.85)',
              }}
            />
            <div
              style={{
                display: 'flex',
                fontSize: 26,
                fontWeight: 700,
                color: '#ffe866',
              }}
            >
              arcadeum.games
            </div>
          </div>
        </div>

        {/* RIGHT — board + sonar */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginLeft: 24,
            padding: BOARD_PAD,
            borderRadius: 16,
            background: 'rgba(7, 20, 38, 0.55)',
            border: '1px solid rgba(120, 180, 230, 0.18)',
            position: 'relative',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45)',
          }}
        >
          {Array.from({ length: ROWS }).map((_, row) => (
            <div key={row} style={{ display: 'flex' }}>
              {Array.from({ length: COLS }).map((_, col) => {
                const state = cellState(col, row);
                const isTarget = col === TARGET.col && row === TARGET.row;
                return (
                  <div
                    key={col}
                    style={{
                      width: CELL,
                      height: CELL,
                      border: '1px solid rgba(120, 180, 230, 0.10)',
                      background: isTarget ? '#ff5530' : CELL_BG[state],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isTarget
                        ? '0 0 28px rgba(255, 85, 48, 0.95)'
                        : 'none',
                    }}
                  >
                    {isTarget ? (
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 9,
                          background: 'white',
                          boxShadow: '0 0 12px rgba(255, 255, 255, 0.9)',
                        }}
                      />
                    ) : state === 'hit' ? (
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: 7,
                          background: 'white',
                        }}
                      />
                    ) : state === 'miss' ? (
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          background: 'rgba(255, 255, 255, 0.55)',
                        }}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Sonar rings — concentric circles fading outward */}
          {[
            { size: 70, opacity: 0.65 },
            { size: 110, opacity: 0.42 },
            { size: 156, opacity: 0.22 },
            { size: 210, opacity: 0.1 },
          ].map(({ size: ringSize, opacity }) => (
            <div
              key={ringSize}
              style={{
                position: 'absolute',
                left: targetX - ringSize / 2,
                top: targetY - ringSize / 2,
                width: ringSize,
                height: ringSize,
                borderRadius: ringSize / 2,
                border: `2px solid rgba(255, 149, 0, ${opacity})`,
              }}
            />
          ))}

          {/* "H-5 · HIT" coordinate readout above the strike */}
          <div
            style={{
              position: 'absolute',
              left: targetX + 18,
              top: targetY - 50,
              display: 'flex',
              alignItems: 'center',
              padding: '4px 10px',
              borderRadius: 6,
              background: 'rgba(255, 85, 48, 0.92)',
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: 1.5,
              color: 'white',
              boxShadow: '0 4px 14px rgba(255, 85, 48, 0.45)',
            }}
          >
            H-5 · HIT
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

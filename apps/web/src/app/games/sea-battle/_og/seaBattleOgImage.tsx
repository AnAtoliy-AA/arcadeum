import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Sea Battle — free online Battleship on Arcadeum';

const CELL = 38;
const ROWS = 10;
const COLS = 10;

type ShipPlacement = {
  col: number;
  row: number;
  len: number;
  horiz: boolean;
  hits: number;
};

const SHIPS: ShipPlacement[] = [
  { col: 1, row: 1, len: 5, horiz: true, hits: 2 },
  { col: 7, row: 2, len: 4, horiz: false, hits: 1 },
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
  ship: 'rgba(255, 149, 0, 0.65)',
  miss: 'rgba(255, 255, 255, 0.18)',
  empty: 'rgba(255, 255, 255, 0.04)',
};

export function renderSeaBattleOgImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background:
            'linear-gradient(135deg, #0a1428 0%, #143055 55%, #1e3a5f 100%)',
          padding: '64px 80px',
          color: 'white',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 26,
              letterSpacing: 6,
              color: '#ff9500',
              fontWeight: 700,
              marginBottom: 20,
            }}
          >
            PLAY FREE · NO SIGNUP
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 144,
              lineHeight: 1,
              fontWeight: 900,
              color: 'white',
              marginBottom: 28,
              letterSpacing: -2,
            }}
          >
            Sea Battle
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 34,
              color: '#a8c5e6',
              lineHeight: 1.3,
              maxWidth: 600,
            }}
          >
            Multiplayer Battleship in your browser. 2–4 players, AI bots, 10+
            themes.
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: 56,
              gap: 14,
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                background: '#ff9500',
              }}
            />
            <div
              style={{
                display: 'flex',
                fontSize: 28,
                fontWeight: 700,
                color: '#ffe866',
              }}
            >
              arcadeum.games
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginLeft: 32,
            padding: 18,
            borderRadius: 16,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          {Array.from({ length: ROWS }).map((_, row) => (
            <div key={row} style={{ display: 'flex' }}>
              {Array.from({ length: COLS }).map((_, col) => {
                const state = cellState(col, row);
                return (
                  <div
                    key={col}
                    style={{
                      width: CELL,
                      height: CELL,
                      border: '1px solid rgba(255, 255, 255, 0.10)',
                      background: CELL_BG[state],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {state === 'hit' ? (
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
        </div>
      </div>
    ),
    { ...size },
  );
}

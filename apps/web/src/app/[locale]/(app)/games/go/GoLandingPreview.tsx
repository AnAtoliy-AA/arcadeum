import { getGoTheme } from '@/widgets/BoardGames/GoGame/lib/theme';
import { GameLandingPreview } from '@/features/games/ui/landing/GameLandingPreview';

// Fixed mid-game 9×9 snapshot — a corner enclosure, a running fight and
// star points make the position recognisably "Go".
const STONES: Array<[number, number, 'black' | 'white']> = [
  [2, 2, 'black'],
  [2, 3, 'black'],
  [3, 2, 'black'],
  [2, 6, 'white'],
  [3, 6, 'white'],
  [4, 5, 'black'],
  [4, 6, 'white'],
  [5, 6, 'black'],
  [6, 2, 'white'],
  [6, 3, 'white'],
];

export function GoLandingPreview() {
  return (
    <GameLandingPreview
      render={(themeId) => {
        const theme = getGoTheme(themeId);
        const size = 9;
        return (
          <div
            aria-hidden="true"
            className="box-border w-full max-w-[360px] mx-auto aspect-square p-3 rounded-2xl border shadow-xl relative overflow-hidden"
            style={{
              background: theme.boardBackground,
              borderColor: theme.gridLine,
            }}
          >
            <div
              className="grid h-full w-full"
              style={{
                gridTemplateColumns: `repeat(${size}, 1fr)`,
                gridTemplateRows: `repeat(${size}, 1fr)`,
              }}
            >
              {Array.from({ length: size * size }).map((_, idx) => {
                const row = Math.floor(idx / size);
                const col = idx % size;
                const stone = STONES.find(([r, c]) => r === row && c === col);
                const isStar =
                  (row === 2 || row === 6) && (col === 2 || col === 6);
                const isCenterStar = row === 4 && col === 4;
                return (
                  <div
                    key={idx}
                    className="relative flex items-center justify-center"
                  >
                    <span
                      className="absolute"
                      style={{
                        inset: '0',
                        borderTop: `1px solid ${theme.gridLine}`,
                        borderLeft: `1px solid ${theme.gridLine}`,
                      }}
                    />
                    {(isStar || isCenterStar) && !stone ? (
                      <span
                        className="rounded-full"
                        style={{
                          width: '16%',
                          height: '16%',
                          background: theme.gridLine,
                        }}
                      />
                    ) : null}
                    {stone ? (
                      <span
                        className="absolute rounded-full"
                        style={{
                          width: '80%',
                          height: '80%',
                          background:
                            stone[2] === 'black'
                              ? theme.blackStone
                              : theme.whiteStone,
                          border: `1px solid ${theme.stoneBorder}`,
                          boxShadow: '0 1px 2px rgba(0,0,0,0.35)',
                        }}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }}
      testId="go-landing-preview"
    />
  );
}

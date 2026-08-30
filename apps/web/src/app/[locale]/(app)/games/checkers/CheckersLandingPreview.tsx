import { getCheckersTheme } from '@/widgets/BoardGames/CheckersGame/lib/theme';
import { GameLandingPreview } from '@/features/games/ui/landing/GameLandingPreview';

const DEMO_BOARD: Array<Array<string | null>> = [
  [null, 'b', null, 'b', null, 'b', null, 'b'],
  ['b', null, 'b', null, 'b', null, 'b', null],
  [null, 'b', null, null, null, 'b', null, 'b'],
  [null, null, null, 'b', null, null, null, null],
  [null, null, null, null, 'w', null, null, null],
  ['w', null, 'w', null, null, null, 'w', null],
  [null, 'w', null, 'w', null, 'w', null, 'w'],
  ['w', null, 'w', null, 'w', null, 'w', null],
];

export function CheckersLandingPreview() {
  return (
    <GameLandingPreview
      testId="checkers-landing-preview"
      render={(themeId) => {
        const theme = getCheckersTheme(themeId);
        return (
          <div
            aria-hidden="true"
            className="box-border w-full max-w-[320px] mx-auto aspect-square p-2.5 rounded-2xl border shadow-xl grid grid-cols-8 grid-rows-8 gap-0.5"
            style={{
              background: theme.boardBackground,
              borderColor: theme.textColor + '40',
            }}
          >
            {DEMO_BOARD.map((row, rowIdx) =>
              row.map((cell, colIdx) => {
                const isDark = (rowIdx + colIdx) % 2 === 1;
                return (
                  <div
                    key={`${rowIdx}-${colIdx}`}
                    className="box-border flex items-center justify-center rounded-sm"
                    style={{
                      background: isDark ? theme.darkSquare : theme.lightSquare,
                    }}
                  >
                    {cell === 'b' ? (
                      <span
                        className="box-border w-5 h-5 sm:w-6 sm:h-6 rounded-full shadow-md flex items-center justify-center text-[10px] font-bold"
                        style={{
                          background: theme.darkPiece,
                          border: `2px solid ${theme.darkPieceBorder}`,
                          color: theme.lightPiece,
                        }}
                      >
                        ●
                      </span>
                    ) : cell === 'w' ? (
                      <span
                        className="box-border w-5 h-5 sm:w-6 sm:h-6 rounded-full shadow-md flex items-center justify-center text-[10px] font-bold"
                        style={{
                          background: theme.lightPiece,
                          border: `2px solid ${theme.lightPieceBorder}`,
                          color: theme.darkPiece,
                        }}
                      >
                        ●
                      </span>
                    ) : null}
                  </div>
                );
              }),
            )}
          </div>
        );
      }}
    />
  );
}

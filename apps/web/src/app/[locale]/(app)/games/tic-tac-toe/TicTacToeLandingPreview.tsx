import { getTicTacToeTheme } from '@/widgets/BoardGames/TicTacToeGame/lib/theme';
import { GameLandingPreview } from '@/features/games/ui/landing/GameLandingPreview';

const DEMO_GRID = [
  ['X', 'O', 'X'],
  ['O', 'X', null],
  [null, null, 'O'],
];

export function TicTacToeLandingPreview() {
  return (
    <GameLandingPreview
      testId="tic-tac-toe-landing-preview"
      render={(themeId) => {
        const theme = getTicTacToeTheme(themeId);
        return (
          <div
            aria-hidden="true"
            className="box-border w-full max-w-[280px] mx-auto aspect-square p-3 rounded-2xl border shadow-xl grid grid-cols-3 grid-rows-3 gap-2"
            style={{
              background: theme.boardBackground,
              borderColor: theme.gridLine + '55',
            }}
          >
            {DEMO_GRID.map((row, rowIdx) =>
              row.map((cell, colIdx) => (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  className="box-border flex items-center justify-center rounded-xl border text-2xl sm:text-3xl font-black select-none"
                  style={{
                    background: theme.cellBg,
                    borderColor: theme.gridLine + '40',
                  }}
                >
                  {cell === 'X' ? (
                    <span style={{ color: theme.xColor }}>✕</span>
                  ) : cell === 'O' ? (
                    <span style={{ color: theme.oColor }}>◯</span>
                  ) : null}
                </div>
              )),
            )}
          </div>
        );
      }}
    />
  );
}

import { getChessTheme } from '@/widgets/BoardGames/ChessGame/lib/theme';
import { GameLandingPreview } from '@/features/games/ui/landing/GameLandingPreview';

const DEMO_BOARD: Array<Array<string | null>> = [
  ['r', 'n', 'b', 'q', 'k', 'b', null, 'r'],
  ['p', 'p', 'p', null, 'p', 'p', 'p', 'p'],
  [null, null, null, null, null, 'n', null, null],
  [null, null, null, 'p', null, null, null, null],
  [null, null, 'B', 'P', null, null, null, null],
  [null, null, 'N', null, null, null, null, null],
  ['P', 'P', 'P', null, 'P', 'P', 'P', 'P'],
  ['R', null, 'B', 'Q', 'K', null, 'N', 'R'],
];

const PIECE_GLYPHS: Record<string, string> = {
  K: '♔',
  Q: '♕',
  R: '♖',
  B: '♗',
  N: '♘',
  P: '♙',
  k: '♚',
  q: '♛',
  r: '♜',
  b: '♝',
  n: '♞',
  p: '♟',
};

export function ChessLandingPreview() {
  return (
    <GameLandingPreview
      testId="chess-landing-preview"
      render={(themeId) => {
        const theme = getChessTheme(themeId);
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
                const isLight = (rowIdx + colIdx) % 2 === 0;
                return (
                  <div
                    key={`${rowIdx}-${colIdx}`}
                    className="box-border flex items-center justify-center rounded-sm text-lg sm:text-xl font-bold select-none"
                    style={{
                      background: isLight
                        ? theme.lightSquare
                        : theme.darkSquare,
                      color: isLight
                        ? theme.darkPieceColor
                        : theme.lightPieceColor,
                    }}
                  >
                    {cell ? PIECE_GLYPHS[cell] : ''}
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

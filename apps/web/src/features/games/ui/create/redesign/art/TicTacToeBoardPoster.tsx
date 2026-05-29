import { getTicTacToeTheme } from '@/widgets/TicTacToeGame/lib/theme';
import type { TicTacToeThemeMeta } from '../data/themes';

interface Props {
  theme: TicTacToeThemeMeta;
  size?: 'sm' | 'lg';
}

type Mark = 'x' | 'o' | null;

// Fixed mid-game snapshot — X wins the main diagonal so themes are visually
// comparable and the winning line is easy to recognize.
const BOARD: Mark[][] = [
  ['x', null, 'o'],
  [null, 'x', null],
  ['o', null, 'x'],
];
const WIN_CELLS = new Set(['0:0', '1:1', '2:2']);

export function TicTacToeBoardPoster({ theme, size = 'sm' }: Props) {
  const big = size === 'lg';
  // Match the wide aspect used by SeaBattle/Glimworm posters so the picker
  // card thumbnail (sm) and rail preview (lg) slot don't show empty bars.
  const w = big ? 400 : 240;
  const h = big ? 320 : 135;

  const tokens = getTicTacToeTheme(theme.id);

  // Center a square board inside the wide container.
  const boardSize = Math.min(w, h) - (big ? 32 : 16);
  const boardX = (w - boardSize) / 2;
  const boardY = (h - boardSize) / 2;
  const pad = big ? 8 : 5;
  const gap = big ? 5 : 3;
  const inner = boardSize - pad * 2;
  const cell = (inner - gap * 2) / 3;
  const markSize = cell * 0.6;

  const bgIsGradient = tokens.background.startsWith('linear-gradient');
  const gradientId = `ttt-bg-${theme.id}`;
  const bgFill = bgIsGradient ? `url(#${gradientId})` : tokens.background;

  // Extract two colors from `linear-gradient(135deg, #a 0%, #b 100%)`.
  const gradientStops = bgIsGradient
    ? Array.from(tokens.background.matchAll(/#[0-9a-fA-F]{3,8}/g)).map(
        (m) => m[0],
      )
    : [];
  const from = gradientStops[0] ?? '#000';
  const to = gradientStops[1] ?? gradientStops[0] ?? '#000';

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMid slice"
      width="100%"
      height="100%"
      role="img"
      aria-label={`${theme.name} tic-tac-toe preview`}
      style={{ display: 'block' }}
    >
      {bgIsGradient ? (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
      ) : null}
      <rect x={0} y={0} width={w} height={h} fill={bgFill} />

      <rect
        x={boardX}
        y={boardY}
        width={boardSize}
        height={boardSize}
        rx={big ? 14 : 8}
        fill={tokens.gridLine}
      />
      {BOARD.map((row, r) =>
        row.map((mark, c) => {
          const x = boardX + pad + c * (cell + gap);
          const y = boardY + pad + r * (cell + gap);
          const isWin = WIN_CELLS.has(`${r}:${c}`);
          const cx = x + cell / 2;
          const cy = y + cell / 2;
          const half = markSize / 2;
          const color = mark === 'x' ? tokens.xColor : tokens.oColor;
          const strokeW = big ? 7 : 4;
          return (
            <g key={`${r}-${c}`}>
              <rect
                x={x}
                y={y}
                width={cell}
                height={cell}
                rx={big ? 8 : 4}
                fill={isWin ? tokens.winningCellBg : tokens.cellBg}
              />
              {mark === 'x' ? (
                <g stroke={color} strokeWidth={strokeW} strokeLinecap="round">
                  <line
                    x1={cx - half}
                    y1={cy - half}
                    x2={cx + half}
                    y2={cy + half}
                  />
                  <line
                    x1={cx + half}
                    y1={cy - half}
                    x2={cx - half}
                    y2={cy + half}
                  />
                </g>
              ) : mark === 'o' ? (
                <circle
                  cx={cx}
                  cy={cy}
                  r={half}
                  fill="none"
                  stroke={color}
                  strokeWidth={strokeW}
                />
              ) : null}
            </g>
          );
        }),
      )}
    </svg>
  );
}

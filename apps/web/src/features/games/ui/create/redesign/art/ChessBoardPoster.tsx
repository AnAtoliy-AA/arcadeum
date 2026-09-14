import type { ChessThemeMeta } from '../data/themes';
import { getChessTheme } from '@/widgets/BoardGames/ChessGame/lib/theme';
import { getThemeById } from '@/features/games/lib/shared-themes';

interface Props {
  theme: ChessThemeMeta;
  size?: 'sm' | 'lg';
}

export function ChessBoardPoster({ theme, size = 'sm' }: Props) {
  const big = size === 'lg';
  const w = big ? 400 : 240;
  const h = big ? 320 : 135;
  const cellSize = big ? 36 : 22;
  const boardSize = cellSize * 8;
  const offsetX = (w - boardSize) / 2;
  const offsetY = (h - boardSize) / 2;

  const shared = getThemeById(theme.id);
  const chessTheme = getChessTheme(theme.id);

  const is960 = theme.id === 'chess960';
  const bgColor = is960 ? '#1a2a3a' : (shared?.colors.background ?? '#0f172a');
  const boardBg = is960
    ? '#0f1d2d'
    : (shared?.colors.surface ?? chessTheme.boardBackground);
  const lightSquare = is960 ? '#c8d6e5' : chessTheme.lightSquare;
  const darkSquare = is960 ? '#5b7fa5' : chessTheme.darkSquare;
  const darkPiece = is960 ? '#0f1d2d' : chessTheme.darkPieceColor;
  const lightPiece = is960 ? '#f8fafc' : chessTheme.lightPieceColor;

  const squares: React.ReactElement[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const isLight = (r + c) % 2 === 0;
      squares.push(
        <rect
          key={`${r}-${c}`}
          x={offsetX + c * cellSize}
          y={offsetY + r * cellSize}
          width={cellSize}
          height={cellSize}
          fill={isLight ? lightSquare : darkSquare}
        />,
      );
    }
  }

  const pieces: Array<{
    r: number;
    c: number;
    symbol: string;
    fill: string;
    stroke: string;
  }> = [
    {
      r: 7,
      c: 0,
      symbol: '♜',
      fill: darkPiece,
      stroke: 'rgba(255,255,255,0.2)',
    },
    {
      r: 7,
      c: 1,
      symbol: '♞',
      fill: darkPiece,
      stroke: 'rgba(255,255,255,0.2)',
    },
    {
      r: 7,
      c: 2,
      symbol: '♝',
      fill: darkPiece,
      stroke: 'rgba(255,255,255,0.2)',
    },
    {
      r: 7,
      c: 3,
      symbol: '♛',
      fill: darkPiece,
      stroke: 'rgba(255,255,255,0.2)',
    },
    {
      r: 7,
      c: 4,
      symbol: '♚',
      fill: darkPiece,
      stroke: 'rgba(255,255,255,0.2)',
    },
    {
      r: 7,
      c: 5,
      symbol: '♝',
      fill: darkPiece,
      stroke: 'rgba(255,255,255,0.2)',
    },
    {
      r: 7,
      c: 6,
      symbol: '♞',
      fill: darkPiece,
      stroke: 'rgba(255,255,255,0.2)',
    },
    {
      r: 7,
      c: 7,
      symbol: '♜',
      fill: darkPiece,
      stroke: 'rgba(255,255,255,0.2)',
    },
    {
      r: 6,
      c: 3,
      symbol: '♟',
      fill: darkPiece,
      stroke: 'rgba(255,255,255,0.2)',
    },
    {
      r: 6,
      c: 4,
      symbol: '♟',
      fill: darkPiece,
      stroke: 'rgba(255,255,255,0.2)',
    },
    { r: 0, c: 0, symbol: '♖', fill: lightPiece, stroke: 'rgba(0,0,0,0.3)' },
    { r: 0, c: 1, symbol: '♘', fill: lightPiece, stroke: 'rgba(0,0,0,0.3)' },
    { r: 0, c: 2, symbol: '♗', fill: lightPiece, stroke: 'rgba(0,0,0,0.3)' },
    { r: 0, c: 3, symbol: '♕', fill: lightPiece, stroke: 'rgba(0,0,0,0.3)' },
    { r: 0, c: 4, symbol: '♔', fill: lightPiece, stroke: 'rgba(0,0,0,0.3)' },
    { r: 0, c: 5, symbol: '♗', fill: lightPiece, stroke: 'rgba(0,0,0,0.3)' },
    { r: 0, c: 6, symbol: '♘', fill: lightPiece, stroke: 'rgba(0,0,0,0.3)' },
    { r: 0, c: 7, symbol: '♖', fill: lightPiece, stroke: 'rgba(0,0,0,0.3)' },
    { r: 1, c: 3, symbol: '♙', fill: lightPiece, stroke: 'rgba(0,0,0,0.3)' },
    { r: 1, c: 4, symbol: '♙', fill: lightPiece, stroke: 'rgba(0,0,0,0.3)' },
  ];

  const pieceElements = pieces.map((p) => (
    <text
      key={`${p.r}-${p.c}`}
      x={offsetX + p.c * cellSize + cellSize / 2}
      y={offsetY + p.r * cellSize + cellSize * 0.78}
      textAnchor="middle"
      fill={p.fill}
      stroke={p.stroke}
      strokeWidth={0.5}
      fontSize={cellSize * 0.75}
      fontWeight="bold"
    >
      {p.symbol}
    </text>
  ));

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect width={w} height={h} fill={bgColor} />
      <rect
        x={offsetX - 2}
        y={offsetY - 2}
        width={boardSize + 4}
        height={boardSize + 4}
        fill={boardBg}
        rx={4}
      />
      {squares}
      {pieceElements}
    </svg>
  );
}

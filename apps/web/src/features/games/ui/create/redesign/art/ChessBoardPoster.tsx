import type { ChessThemeMeta } from '../data/themes';

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

  const lightSquare = theme.id === 'chess960' ? '#c8d6e5' : '#f0f0f0';
  const darkSquare = theme.id === 'chess960' ? '#5b7fa5' : '#769656';
  const bgColor = theme.id === 'chess960' ? '#1a2a3a' : '#1a1a2e';

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
  }> = [
    { r: 7, c: 0, symbol: '♜', fill: '#1a1a2e' },
    { r: 7, c: 1, symbol: '♞', fill: '#1a1a2e' },
    { r: 7, c: 2, symbol: '♝', fill: '#1a1a2e' },
    { r: 7, c: 3, symbol: '♛', fill: '#1a1a2e' },
    { r: 7, c: 4, symbol: '♚', fill: '#1a1a2e' },
    { r: 7, c: 5, symbol: '♝', fill: '#1a1a2e' },
    { r: 7, c: 6, symbol: '♞', fill: '#1a1a2e' },
    { r: 7, c: 7, symbol: '♜', fill: '#1a1a2e' },
    { r: 6, c: 3, symbol: '♟', fill: '#1a1a2e' },
    { r: 6, c: 4, symbol: '♟', fill: '#1a1a2e' },
    { r: 0, c: 0, symbol: '♖', fill: '#f5f5f5' },
    { r: 0, c: 1, symbol: '♘', fill: '#f5f5f5' },
    { r: 0, c: 2, symbol: '♗', fill: '#f5f5f5' },
    { r: 0, c: 3, symbol: '♕', fill: '#f5f5f5' },
    { r: 0, c: 4, symbol: '♔', fill: '#f5f5f5' },
    { r: 0, c: 5, symbol: '♗', fill: '#f5f5f5' },
    { r: 0, c: 6, symbol: '♘', fill: '#f5f5f5' },
    { r: 0, c: 7, symbol: '♖', fill: '#f5f5f5' },
    { r: 1, c: 3, symbol: '♙', fill: '#f5f5f5' },
    { r: 1, c: 4, symbol: '♙', fill: '#f5f5f5' },
  ];

  const pieceElements = pieces.map((p) => (
    <text
      key={`${p.r}-${p.c}`}
      x={offsetX + p.c * cellSize + cellSize / 2}
      y={offsetY + p.r * cellSize + cellSize * 0.78}
      textAnchor="middle"
      fill={p.fill}
      stroke="none"
      fontSize={cellSize * 0.75}
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
      {squares}
      {pieceElements}
    </svg>
  );
}

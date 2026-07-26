import type { CheckersThemeMeta } from '../data/checkers-themes';

interface Props {
  theme: CheckersThemeMeta;
  size?: 'sm' | 'lg';
}

const THEME_COLORS: Record<
  string,
  {
    light: string;
    dark: string;
    bg: string;
    lightPiece: string;
    darkPiece: string;
  }
> = {
  classic: {
    light: '#f5f5f4',
    dark: '#57534e',
    bg: '#292524',
    lightPiece: '#fafaf9',
    darkPiece: '#292524',
  },
  neon: {
    light: '#1e293b',
    dark: '#4c1d95',
    bg: '#0f172a',
    lightPiece: '#e0e7ff',
    darkPiece: '#312e81',
  },
  wood: {
    light: '#d4a574',
    dark: '#92400e',
    bg: '#451a03',
    lightPiece: '#fef3c7',
    darkPiece: '#451a03',
  },
  marble: {
    light: '#f1f5f9',
    dark: '#64748b',
    bg: '#1e293b',
    lightPiece: '#ffffff',
    darkPiece: '#334155',
  },
  neon_glow: {
    light: '#1e1b4b',
    dark: '#312e81',
    bg: '#0f172a',
    lightPiece: '#c4b5fd',
    darkPiece: '#3b0764',
  },
};

export function CheckersBoardPoster({ theme, size = 'sm' }: Props) {
  const big = size === 'lg';
  const w = big ? 400 : 240;
  const h = big ? 320 : 135;
  const cellSize = big ? 36 : 22;
  const boardSize = cellSize * 8;
  const offsetX = (w - boardSize) / 2;
  const offsetY = (h - boardSize) / 2;

  const colors = THEME_COLORS[theme.id] ?? THEME_COLORS.classic;

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
          fill={isLight ? colors.light : colors.dark}
        />,
      );
    }
  }

  const pieces: Array<{ r: number; c: number; fill: string }> = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) pieces.push({ r, c, fill: colors.darkPiece });
    }
  }
  for (let r = 5; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) pieces.push({ r, c, fill: colors.lightPiece });
    }
  }

  const pieceElements = pieces.map((p) => (
    <circle
      key={`${p.r}-${p.c}`}
      cx={offsetX + p.c * cellSize + cellSize / 2}
      cy={offsetY + p.r * cellSize + cellSize / 2}
      r={cellSize * 0.38}
      fill={p.fill}
      stroke={
        p.fill === colors.lightPiece
          ? 'rgba(0,0,0,0.15)'
          : 'rgba(255,255,255,0.1)'
      }
      strokeWidth={1}
    />
  ));

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect width={w} height={h} fill={colors.bg} />
      {squares}
      {pieceElements}
    </svg>
  );
}

import type { BackgammonThemeMeta } from '../data/backgammon-themes';
import { getBackgammonTheme } from '@/widgets/BoardGames/BackgammonGame/lib/theme';

interface Props {
  theme: BackgammonThemeMeta;
  size?: 'sm' | 'lg';
}

export function BackgammonBoardPoster({
  theme: themeMeta,
  size = 'sm',
}: Props) {
  const big = size === 'lg';
  const w = big ? 400 : 240;
  const h = big ? 320 : 135;

  const theme = getBackgammonTheme(themeMeta.id);

  const boardW = w * 0.9;
  const boardH = h * 0.85;
  const offsetX = (w - boardW) / 2;
  const offsetY = (h - boardH) / 2;

  const pointW = (boardW * 0.44) / 6;
  const pointH = boardH * 0.4;
  const barW = boardW * 0.08;

  return (
    <svg
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
      viewBox={`0 0 ${w} ${h}`}
    >
      <rect fill={theme.boardBackground} height={h} width={w} />

      <rect
        fill="rgba(0,0,0,0.2)"
        height={boardH}
        rx={8}
        stroke={theme.barBorder}
        strokeWidth={1.5}
        width={boardW}
        x={offsetX}
        y={offsetY}
      />

      <rect
        fill={theme.barBackground}
        height={boardH}
        width={barW}
        x={offsetX + boardW * 0.44 + (boardW * 0.12 - barW) / 2}
        y={offsetY}
      />

      {Array.from({ length: 6 }).map((_, i) => (
        <polygon
          fill={i % 2 === 0 ? theme.pointDark : theme.pointLight}
          key={`top-left-${i}`}
          points={`${offsetX + i * pointW},${offsetY} ${offsetX + (i + 1) * pointW},${offsetY} ${offsetX + (i + 0.5) * pointW},${offsetY + pointH}`}
        />
      ))}

      {Array.from({ length: 6 }).map((_, i) => (
        <polygon
          fill={i % 2 === 1 ? theme.pointDark : theme.pointLight}
          key={`top-right-${i}`}
          points={`${offsetX + boardW * 0.56 + i * pointW},${offsetY} ${offsetX + boardW * 0.56 + (i + 1) * pointW},${offsetY} ${offsetX + boardW * 0.56 + (i + 0.5) * pointW},${offsetY + pointH}`}
        />
      ))}

      {Array.from({ length: 6 }).map((_, i) => (
        <polygon
          fill={i % 2 === 1 ? theme.pointDark : theme.pointLight}
          key={`bot-left-${i}`}
          points={`${offsetX + i * pointW},${offsetY + boardH} ${offsetX + (i + 1) * pointW},${offsetY + boardH} ${offsetX + (i + 0.5) * pointW},${offsetY + boardH - pointH}`}
        />
      ))}

      {Array.from({ length: 6 }).map((_, i) => (
        <polygon
          fill={i % 2 === 0 ? theme.pointDark : theme.pointLight}
          key={`bot-right-${i}`}
          points={`${offsetX + boardW * 0.56 + i * pointW},${offsetY + boardH} ${offsetX + boardW * 0.56 + (i + 1) * pointW},${offsetY + boardH} ${offsetX + boardW * 0.56 + (i + 0.5) * pointW},${offsetY + boardH - pointH}`}
        />
      ))}

      <circle
        cx={offsetX + pointW * 0.5}
        cy={offsetY + pointW * 0.6}
        fill={theme.whitePiece}
        r={pointW * 0.4}
        stroke={theme.whitePieceBorder}
        strokeWidth={1}
      />
      <circle
        cx={offsetX + boardW * 0.56 + pointW * 5.5}
        cy={offsetY + pointW * 0.6}
        fill={theme.blackPiece}
        r={pointW * 0.4}
        stroke={theme.blackPieceBorder}
        strokeWidth={1}
      />
      <circle
        cx={offsetX + boardW * 0.56 + pointW * 5.5}
        cy={offsetY + boardH - pointW * 0.6}
        fill={theme.whitePiece}
        r={pointW * 0.4}
        stroke={theme.whitePieceBorder}
        strokeWidth={1}
      />
    </svg>
  );
}

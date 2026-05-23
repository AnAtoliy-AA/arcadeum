import type { ReactElement } from 'react';
import type { SeaBattleThemeMeta } from '../data/themes';

interface Props {
  theme: SeaBattleThemeMeta;
  size?: 'sm' | 'lg';
}

// Fixed ship/hit/miss layout so all themes are visually comparable.
const SHIPS: { r: number; c: number; len: number; dir: 'h' | 'v' }[] = [
  { r: 1, c: 1, len: 4, dir: 'h' },
  { r: 4, c: 0, len: 3, dir: 'h' },
  { r: 6, c: 5, len: 5, dir: 'h' },
  { r: 2, c: 8, len: 4, dir: 'v' },
];
const HITS = [
  { r: 1, c: 2 },
  { r: 6, c: 6 },
  { r: 6, c: 7 },
];
const MISSES = [
  { r: 0, c: 4 },
  { r: 3, c: 6 },
  { r: 5, c: 2 },
  { r: 8, c: 3 },
  { r: 7, c: 8 },
];

export function SeaBattleBoardPoster({ theme, size = 'sm' }: Props) {
  const big = size === 'lg';
  const w = big ? 400 : 240;
  const h = big ? 320 : 135;
  const padX = big ? 50 : 10;
  const padY = big ? 30 : 7;
  const cellW = (w - padX * 2) / 10;
  const cellH = (h - padY * 2) / 10;
  const { bg, cell, ship, hit, miss } = theme.palette;

  const cells: ReactElement[] = [];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      cells.push(
        <rect
          key={`c-${r}-${c}`}
          x={padX + c * cellW}
          y={padY + r * cellH}
          width={cellW - 1}
          height={cellH - 1}
          fill={cell}
          opacity="0.85"
          rx={big ? 2 : 1}
        />,
      );
    }
  }

  const ships: ReactElement[] = [];
  const occupied = new Set<string>();
  for (const s of SHIPS) {
    const sw = s.dir === 'h' ? cellW * s.len - 2 : cellW - 2;
    const sh = s.dir === 'v' ? cellH * s.len - 2 : cellH - 2;
    ships.push(
      <rect
        key={`s-${s.r}-${s.c}`}
        x={padX + s.c * cellW + 1}
        y={padY + s.r * cellH + 1}
        width={sw}
        height={sh}
        fill={ship}
        opacity="0.85"
        rx={big ? 3 : 1.5}
      />,
    );
    for (let i = 0; i < s.len; i++) {
      const r = s.r + (s.dir === 'v' ? i : 0);
      const c = s.c + (s.dir === 'h' ? i : 0);
      occupied.add(`${r}-${c}`);
    }
  }

  const hits = HITS.map((p) => (
    <circle
      key={`h-${p.r}-${p.c}`}
      cx={padX + p.c * cellW + cellW / 2}
      cy={padY + p.r * cellH + cellH / 2}
      r={Math.min(cellW, cellH) * 0.32}
      fill={hit}
    />
  ));

  const misses = MISSES.map((p) => (
    <circle
      key={`m-${p.r}-${p.c}`}
      cx={padX + p.c * cellW + cellW / 2}
      cy={padY + p.r * cellH + cellH / 2}
      r={Math.min(cellW, cellH) * 0.18}
      fill={miss}
      opacity="0.7"
    />
  ));

  const crosshair = big ? (
    <g
      transform={`translate(${padX + 7.5 * cellW + cellW / 2} ${padY + 4.5 * cellH + cellH / 2})`}
      stroke={hit}
      strokeWidth="1.5"
      fill="none"
      opacity="0.85"
    >
      <circle r={cellW * 0.6} />
      <line x1={-cellW * 0.9} x2={-cellW * 0.3} y1="0" y2="0" />
      <line x1={cellW * 0.3} x2={cellW * 0.9} y1="0" y2="0" />
      <line y1={-cellH * 0.9} y2={-cellH * 0.3} x1="0" x2="0" />
      <line y1={cellH * 0.3} y2={cellH * 0.9} x1="0" x2="0" />
    </g>
  ) : null;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect width={w} height={h} fill={bg} />
      {cells}
      {ships}
      {hits}
      {misses}
      {crosshair}
    </svg>
  );
}

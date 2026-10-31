'use client';

import { memo, useMemo } from 'react';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';
import { useCatDashTheme } from '../lib/CatDashThemeContext';
import type { CatDashClientState } from '../types';
import { RealisticCat } from './RealisticCat';
import { BoardBackground } from './BoardBackground';
import {
  getSerpentineTrackPoint,
  getCircularTrackPoint,
  getFigure8TrackPoint,
} from '../lib/boardUtils';
import { useWidgetFullscreen } from '@/features/games/ui/GameWidgetContainer';
import { TrackGates } from './TrackGates';
import { BoardFooter } from './BoardFooter';

interface BoardProps {
  snapshot: CatDashClientState;
  disabled?: boolean;
  resolveName?: (id?: string | null) => string;
  highlightedCells?: { row: number; col: number }[];
}

export const CatDashBoard = memo(function CatDashBoard({
  snapshot,
  disabled: _disabled,
  resolveName = (id) => id ?? '',
  highlightedCells = [],
}: BoardProps) {
  const { t } = useTranslation();
  const { tokens, variant } = useCatDashTheme();
  const isFullscreen = useWidgetFullscreen();

  const total = snapshot.track.length;
  const cols = snapshot.columns || 10;
  const rows = Math.ceil(total / cols);
  const svgW = isFullscreen ? 1120 : 560;
  const svgH =
    snapshot.trackType === 'linear'
      ? isFullscreen
        ? Math.max(520, rows * 78 + 60)
        : Math.max(270, rows * 42 + 48)
      : isFullscreen
        ? 520
        : 280;
  const cx = svgW / 2;
  const cy = svgH / 2;
  const rx = svgW * 0.42;
  const ry = svgH * 0.65;

  const positions = useMemo(() => {
    return snapshot.track.map((_, i) => {
      if (snapshot.trackType === 'linear') {
        const point = getSerpentineTrackPoint(i, total, svgW, svgH, cols);
        const row = Math.floor(i / cols);
        const rowWave = Math.sin(row * 1.15) * 18;
        const depthWave = Math.cos(row * 0.9) * 3;

        return {
          x: point.x + rowWave,
          y: point.y + depthWave,
        };
      }
      if (snapshot.trackType === 'circular') {
        return getCircularTrackPoint(i, total, cx, cy, rx, ry * 0.58);
      }
      return getFigure8TrackPoint(i, total, cx, cy, rx, ry);
    });
  }, [
    snapshot.track,
    snapshot.trackType,
    cols,
    total,
    svgW,
    svgH,
    cx,
    cy,
    rx,
    ry,
  ]);

  const trackPathD = useMemo(() => {
    if (positions.length === 0) return '';
    if (snapshot.trackType !== 'linear') {
      const points = positions.map((p) => `${p.x},${p.y}`);
      return `M ${points[0]} ${points
        .slice(1)
        .map((pt) => `L ${pt}`)
        .join(' ')} Z`;
    }

    let d = `M ${positions[0].x},${positions[0].y}`;
    for (let i = 0; i < positions.length - 1; i++) {
      const current = positions[i];
      const next = positions[i + 1];
      const currRow = Math.floor(i / cols);
      const nextRow = Math.floor((i + 1) / cols);

      if (currRow !== nextRow) {
        const isRightTurn = currRow % 2 === 0;
        const dx = isRightTurn ? 32 : -32;
        d += ` C ${current.x + dx},${current.y} ${next.x + dx},${next.y} ${next.x},${next.y}`;
      } else {
        d += ` L ${next.x},${next.y}`;
      }
    }
    return d;
  }, [positions, snapshot.trackType, cols]);

  const spaceRadius = isFullscreen ? 30 : 22;

  const highlightedSpaceIndices = useMemo(() => {
    const indices = new Set<number>();
    for (const cell of highlightedCells) {
      if (cell.col >= 0 && cell.col < total) indices.add(cell.col);
    }
    return indices;
  }, [highlightedCells, total]);

  const themeName = t('games.cat_dash_v1.lobby.theme' as TranslationKey);

  return (
    <div className="flex w-full flex-col items-center gap-3 p-1 md:p-2">
      <div
        className={`flex w-full items-center justify-between gap-3 px-1 ${
          isFullscreen ? 'max-w-[1120px]' : 'max-w-[560px]'
        }`}
      >
        <div className="flex items-center gap-2 rounded-full border border-fuchsia-300/20 bg-slate-950/55 px-2.5 py-1 backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-fuchsia-400 shadow-[0_0_12px_rgba(232,121,249,0.9)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-100">
            {themeName}
          </span>
        </div>
        <span className="rounded-full border border-white/10 bg-slate-950/45 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-200 backdrop-blur-sm">
          {t('games.cat_dash_v1.lobby.trackType' as TranslationKey)}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        width="100%"
        className={`w-full rounded-[28px] overflow-hidden border border-white/10 shadow-2xl shadow-black/25 ${
          isFullscreen ? 'max-w-[1120px]' : 'max-w-[560px]'
        }`}
        role="img"
        aria-label={themeName}
      >
        <BoardBackground
          variant={variant}
          tokens={tokens}
          svgW={svgW}
          svgH={svgH}
        />
        <rect
          x="8"
          y="8"
          width={svgW - 16}
          height={svgH - 16}
          rx="26"
          fill="none"
          stroke={tokens.trackBorder}
          strokeWidth="1"
          opacity="0.35"
        />

        <path
          d={trackPathD}
          fill="none"
          stroke={tokens.trackBorder}
          strokeWidth={spaceRadius * 2 + 8}
          opacity={0.2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d={trackPathD}
          fill="none"
          stroke={tokens.track}
          strokeWidth={spaceRadius * 2 + 3}
          opacity={0.72}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d={trackPathD}
          fill="none"
          stroke={tokens.trackBorder}
          strokeWidth={spaceRadius * 2 - 9}
          opacity={0.2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d={trackPathD}
          fill="none"
          stroke={tokens.trackBorder}
          strokeWidth={2}
          opacity={0.7}
          strokeDasharray="3 9"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {positions.length > 1 && (
          <TrackGates
            start={positions[0]}
            finish={positions[positions.length - 1]}
            tokens={tokens}
            startLabel={t(
              'games.cat_dash_v1.board.startUpper' as TranslationKey,
            )}
            finishLabel={t(
              'games.cat_dash_v1.board.finishUpper' as TranslationKey,
            )}
            isFullscreen={isFullscreen}
          />
        )}

        {snapshot.track.map((space, i) => {
          const pos = positions[i];
          const isStart = i === 0;
          const isFinish = i === total - 1;
          const isSpecial =
            space.type === 'obstacle' ||
            space.type === 'bonus' ||
            space.type === 'fork';
          const spaceIcon =
            space.type === 'obstacle'
              ? '⚡'
              : space.type === 'bonus'
                ? '⭐'
                : space.type === 'fork'
                  ? '🔀'
                  : null;
          const tileRadius = spaceRadius * 1.05;
          const tilePath = [0, 1, 2, 3, 4, 5]
            .map((pointIndex) => {
              const angle = (Math.PI / 3) * pointIndex - Math.PI / 6;
              const command = pointIndex === 0 ? 'M' : 'L';
              return `${command} ${pos.x + tileRadius * Math.cos(angle)} ${pos.y + tileRadius * Math.sin(angle)}`;
            })
            .join(' ')
            .concat(' Z');
          const playersHere = snapshot.players.filter(
            (p) => p.position === space.id && p.isReady,
          );
          const isOccupied = playersHere.length > 0;

          let fill = tokens.normalSpace;
          if (isStart) fill = '#22c55e';
          else if (isFinish) fill = '#f59e0b';
          else if (space.type === 'obstacle') fill = tokens.obstacleSpace;
          else if (space.type === 'bonus') fill = tokens.bonusSpace;
          else if (space.type === 'fork') fill = tokens.forkSpace;

          return (
            <g key={space.id ?? i}>
              {highlightedSpaceIndices.has(i) && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={spaceRadius + 5}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth={3}
                  opacity={0.7}
                  className="animate-pulse"
                  filter="url(#glow)"
                />
              )}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={spaceRadius + 2}
                fill="none"
                stroke={fill}
                strokeWidth={1.5}
                opacity={isOccupied ? 0.8 : 0.2}
                filter="url(#glow)"
              />

              <path
                d={tilePath}
                fill={fill}
                stroke={
                  isOccupied ? tokens.playerBorder : 'rgba(255,255,255,0.15)'
                }
                strokeWidth={isOccupied ? 2.5 : 1}
                filter={isSpecial ? 'url(#glow)' : undefined}
                className="transition-all duration-300"
              />

              {!isOccupied && isSpecial && spaceIcon ? (
                <>
                  <text
                    x={pos.x}
                    y={pos.y - 5}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={11}
                    className="pointer-events-none select-none"
                  >
                    {spaceIcon}
                  </text>
                  <text
                    x={pos.x}
                    y={pos.y + 12}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={7}
                    fontWeight="800"
                    fill="#ffffff"
                    opacity={0.75}
                    className="pointer-events-none select-none"
                  >
                    {i + 1}
                  </text>
                </>
              ) : !isOccupied ? (
                <text
                  x={pos.x}
                  y={pos.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={10}
                  fontWeight="800"
                  fill="#ffffff"
                  className="pointer-events-none select-none"
                >
                  {i + 1}
                </text>
              ) : null}

              {snapshot.traps?.some((t) => t.spaceId === space.id) && (
                <g
                  transform={`translate(${pos.x}, ${pos.y - spaceRadius - 2})`}
                >
                  <circle
                    r={8}
                    fill="#4c1d95"
                    stroke="#a855f7"
                    strokeWidth={1.5}
                    className="animate-pulse"
                  />
                  <text
                    y={3}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={9}
                    className="select-none"
                  >
                    🪤
                  </text>
                </g>
              )}

              {isOccupied &&
                playersHere.map((p, idx) => {
                  const size = 38;
                  const offsetX = (idx - (playersHere.length - 1) / 2) * 12;
                  const isCurrentTurn =
                    snapshot.players[snapshot.currentPlayerIndex]?.playerId ===
                    p.playerId;
                  const isLead =
                    p.position > 0 &&
                    p.position ===
                      Math.max(...snapshot.players.map((pl) => pl.position));

                  return (
                    <g
                      key={p.playerId}
                      transform={`translate(${pos.x - size / 2 + offsetX}, ${pos.y - size / 2})`}
                      className="transition-transform duration-500 ease-out"
                    >
                      {isLead && (
                        <text
                          x={size / 2}
                          y={-4}
                          textAnchor="middle"
                          fontSize={12}
                          className="select-none filter drop-shadow"
                        >
                          👑
                        </text>
                      )}
                      {isCurrentTurn && (
                        <circle
                          cx={size / 2}
                          cy={size / 2}
                          r={size / 2 + 5}
                          fill="none"
                          stroke="#a855f7"
                          strokeWidth={2}
                          className="animate-ping"
                          opacity={0.6}
                        />
                      )}
                      {p.shielded && (
                        <circle
                          cx={size / 2}
                          cy={size / 2}
                          r={size / 2 + 4}
                          fill="none"
                          stroke="#22d3ee"
                          strokeWidth={2.5}
                          strokeDasharray="4 3"
                          opacity={0.85}
                        />
                      )}
                      <RealisticCat
                        catId={p.catId}
                        size={size}
                        showGlow={true}
                      />
                    </g>
                  );
                })}

              {snapshot.trackType !== 'linear' && isStart && (
                <text
                  x={pos.x}
                  y={pos.y - spaceRadius - 8}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight="bold"
                  fill="#22c55e"
                  filter="url(#glow)"
                >
                  {t('games.cat_dash_v1.board.startUpper' as TranslationKey)}
                </text>
              )}
              {snapshot.trackType !== 'linear' && isFinish && (
                <text
                  x={pos.x}
                  y={pos.y - spaceRadius - 8}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight="bold"
                  fill="#f59e0b"
                  filter="url(#glow)"
                >
                  🏁{' '}
                  {t('games.cat_dash_v1.board.finishUpper' as TranslationKey)}
                </text>
              )}

              {snapshot.trackType === 'linear' ? (
                isStart ? (
                  <circle
                    cx={pos.x}
                    cy={pos.y + spaceRadius + 7}
                    r={3.5}
                    fill="#22c55e"
                    filter="url(#glow)"
                  />
                ) : isFinish ? (
                  <text
                    x={pos.x}
                    y={pos.y + spaceRadius + 7}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={11}
                    className="select-none"
                  >
                    🏁
                  </text>
                ) : null
              ) : (
                !isOccupied &&
                !isStart &&
                !isFinish &&
                space.type !== 'normal' && (
                  <text
                    x={pos.x}
                    y={pos.y + spaceRadius + 7}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={11}
                    className="select-none"
                  >
                    {space.type === 'obstacle'
                      ? '⚡'
                      : space.type === 'bonus'
                        ? '⭐'
                        : '🔀'}
                  </text>
                )
              )}
            </g>
          );
        })}
      </svg>

      <BoardFooter snapshot={snapshot} resolveName={resolveName} />
    </div>
  );
});

'use client';

import { memo, useMemo } from 'react';
import { useCatDashTheme } from '../lib/CatDashThemeContext';
import type { CatDashClientState } from '../types';
import { RealisticCat } from './RealisticCat';
import { BoardBackground } from './BoardBackground';
import {
  getSerpentineTrackPoint,
  getCircularTrackPoint,
  getFigure8TrackPoint,
} from '../lib/boardUtils';

interface BoardProps {
  snapshot: CatDashClientState;
  disabled: boolean;
  resolveName: (id?: string | null) => string;
}

export const CatDashBoard = memo(function CatDashBoard({
  snapshot,
  disabled: _disabled,
  resolveName,
}: BoardProps) {
  const { tokens, variant } = useCatDashTheme();

  const total = snapshot.track.length;
  const cols = snapshot.columns || 10;
  const rows = Math.ceil(total / cols);
  const svgW = 560;
  const svgH =
    snapshot.trackType === 'linear' ? Math.max(340, rows * 64 + 64) : 340;
  const cx = svgW / 2;
  const cy = svgH / 2;
  const rx = svgW * 0.42;
  const ry = svgH * 0.65;

  const positions = useMemo(() => {
    return snapshot.track.map((_, i) => {
      if (snapshot.trackType === 'linear') {
        return getSerpentineTrackPoint(i, total, svgW, svgH, cols);
      }
      if (snapshot.trackType === 'circular') {
        return getCircularTrackPoint(i, total, cx, cy, rx, ry * 0.58);
      }
      return getFigure8TrackPoint(i, total, cx, cy, rx, ry);
    });
  }, [snapshot.track, snapshot.trackType, cols, total, svgH, cx, cy, rx, ry]);

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

  const spaceRadius = 22;

  return (
    <div className="flex flex-col gap-3 items-center w-full p-2">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        width="100%"
        className="max-w-[560px] rounded-3xl overflow-hidden shadow-2xl border border-white/10"
      >
        <BoardBackground
          variant={variant}
          tokens={tokens}
          svgW={svgW}
          svgH={svgH}
        />

        <path
          d={trackPathD}
          fill="none"
          stroke={tokens.trackBorder}
          strokeWidth={spaceRadius * 2 + 8}
          opacity={0.12}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d={trackPathD}
          fill="none"
          stroke={tokens.trackBorder}
          strokeWidth={2}
          opacity={0.4}
          strokeDasharray="6 8"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {snapshot.track.map((space, i) => {
          const pos = positions[i];
          const isStart = i === 0;
          const isFinish = i === total - 1;
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
            <g key={space.id}>
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

              <circle
                cx={pos.x}
                cy={pos.y}
                r={spaceRadius}
                fill={fill}
                stroke={
                  isOccupied ? tokens.playerBorder : 'rgba(255,255,255,0.15)'
                }
                strokeWidth={isOccupied ? 2.5 : 1}
                className="transition-all duration-300"
              />

              {!isOccupied && (
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
              )}

              {isOccupied &&
                playersHere.map((p, idx) => {
                  const size = 38;
                  const offsetX = (idx - (playersHere.length - 1) / 2) * 12;
                  return (
                    <g
                      key={p.playerId}
                      transform={`translate(${pos.x - size / 2 + offsetX}, ${pos.y - size / 2})`}
                    >
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
                  START
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
                  🏁 FINISH
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
                ) : space.type === 'obstacle' ? (
                  <text
                    x={pos.x}
                    y={pos.y + spaceRadius + 7}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={11}
                    className="select-none"
                  >
                    ⚡
                  </text>
                ) : space.type === 'bonus' ? (
                  <text
                    x={pos.x}
                    y={pos.y + spaceRadius + 7}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={11}
                    className="select-none"
                  >
                    ⭐
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

      <div className="flex flex-row items-stretch gap-2.5 flex-wrap justify-center">
        {snapshot.players.map((player) => {
          const isCurrent =
            snapshot.players[snapshot.currentPlayerIndex]?.playerId ===
            player.playerId;
          return (
            <div
              key={player.playerId}
              className={`flex flex-row gap-2.5 items-center px-3.5 py-2 rounded-2xl border transition-all duration-200 ${
                player.isReady ? 'opacity-100' : 'opacity-40'
              } ${
                isCurrent
                  ? 'bg-purple-900/30 border-purple-500/50 ring-1 ring-purple-400/40'
                  : 'bg-slate-900/40 border-white/10'
              }`}
            >
              <RealisticCat catId={player.catId} size={28} />
              <span
                className={`text-sm ${
                  isCurrent
                    ? 'font-extrabold text-white'
                    : 'font-semibold text-slate-300'
                }`}
              >
                {resolveName(player.playerId)}
              </span>
              <span className="text-xs text-slate-400 font-bold">
                🎲 {player.powerTokens}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex flex-row items-stretch gap-4 justify-center flex-wrap pt-1 text-slate-400">
        <div className="flex flex-row gap-1.5 items-center">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_6px_#22c55e]" />
          <span className="text-xs font-semibold">Start</span>
        </div>
        <div className="flex flex-row gap-1.5 items-center">
          <div className="w-2.5 h-2.5 bg-amber-500 rounded-full shadow-[0_0_6px_#f59e0b]" />
          <span className="text-xs font-semibold">Finish</span>
        </div>
        <div className="flex flex-row gap-1.5 items-center">
          <span className="text-sm">⚡</span>
          <span className="text-xs font-semibold">Obstacle</span>
        </div>
        <div className="flex flex-row gap-1.5 items-center">
          <span className="text-sm">⭐</span>
          <span className="text-xs font-semibold">Bonus</span>
        </div>
      </div>
    </div>
  );
});

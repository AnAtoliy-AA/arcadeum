'use client';

import { memo, useMemo } from 'react';
import { useCatDashTheme } from '../lib/CatDashThemeContext';
import type { CatDashClientState } from '../types';

import { RealisticCat } from './RealisticCat';
import { BoardBackground } from './BoardBackground';
import {
  CAT_COLORS,
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

  // Generate SVG path string for the track line
  const trackPathD = useMemo(() => {
    if (positions.length === 0) return '';
    if (snapshot.trackType !== 'linear') {
      const points = positions.map((p) => `${p.x},${p.y}`);
      return `M ${points[0]} ${points
        .slice(1)
        .map((pt) => `L ${pt}`)
        .join(' ')} Z`;
    }

    // Smooth winding serpentine curves for linear track layout
    let d = `M ${positions[0].x},${positions[0].y}`;
    for (let i = 0; i < positions.length - 1; i++) {
      const current = positions[i];
      const next = positions[i + 1];
      const currRow = Math.floor(i / cols);
      const nextRow = Math.floor((i + 1) / cols);

      if (currRow !== nextRow) {
        // Smooth out-of-row loop transition curve at the end of rows
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
    <div className="flex flex-col gap-3 items-center w-full p-3">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        width="100%"
        style={{
          maxWidth: svgW,
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25)',
          border: `1px solid ${tokens.trackBorder}33`,
        }}
      >
        <BoardBackground
          variant={variant}
          tokens={tokens}
          svgW={svgW}
          svgH={svgH}
        />

        {/* Track path line with neon glow style */}
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

        {/* Track spaces */}
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
              {/* Space circle shadow/glow */}
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

              {/* Space circle */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={spaceRadius}
                fill={fill}
                stroke={
                  isOccupied ? tokens.playerBorder : 'rgba(255,255,255,0.15)'
                }
                strokeWidth={isOccupied ? 2.5 : 1}
                style={{ transition: 'all 0.3s ease' }}
              />

              {/* Space number (always rendered for better cell identification) */}
              {!isOccupied && (
                <text
                  x={pos.x}
                  y={pos.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={10}
                  fontWeight="800"
                  fill="#ffffff"
                  style={{
                    pointerEvents: 'none',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))',
                  }}
                >
                  {i + 1}
                </text>
              )}

              {/* Player cat SVG */}
              {isOccupied &&
                playersHere.map((p, idx) => {
                  const size = 38;
                  // Shift slightly if multiple players are on the same spot
                  const offsetX = (idx - (playersHere.length - 1) / 2) * 12;
                  return (
                    <g
                      key={p.playerId}
                      transform={`translate(${pos.x - size / 2 + offsetX}, ${pos.y - size / 2})`}
                    >
                      <RealisticCat catId={p.catId} size={size} />
                    </g>
                  );
                })}

              {/* Start / Finish labels (Only for circular/multiple layouts as linear uses dots/flags under the cells) */}
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

              {/* Layout indicators always rendered under cells */}
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
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
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
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
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
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
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
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
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

      {/* Player legend */}
      <div className="flex flex-row items-stretch gap-3 flex-wrap justify-center">
        {snapshot.players.map((player) => {
          const isCurrent =
            snapshot.players[snapshot.currentPlayerIndex]?.playerId ===
            player.playerId;
          return (
            <div
              className="flex flex-row gap-3 items-center px-4 py-3 rounded-2xl border-[1.5px]"
              style={{
                opacity: player.isReady ? 1 : 0.4,
                backgroundColor: isCurrent
                  ? 'rgba(124,58,237,0.15)'
                  : 'rgba(255,255,255,0.03)',
                borderColor: isCurrent
                  ? tokens.playerBorder
                  : 'rgba(255,255,255,0.08)',
              }}
              key={player.playerId}
            >
              <RealisticCat catId={player.catId} size={28} />
              <span
                className="text-[14px]"
                style={{
                  fontWeight: isCurrent ? 'bold' : 'normal',
                  color: CAT_COLORS[player.catId] ?? tokens.text,
                }}
              >
                {resolveName(player.playerId)}
              </span>
              <span
                className="text-[12px]"
                style={{ color: tokens.textSecondary }}
              >
                🎲 {player.powerTokens}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-row items-stretch gap-3 justify-center flex-wrap">
        <div className="flex flex-row gap-1 items-center">
          <div className="flex flex-row items-stretch w-[12px] h-[12px] bg-[#22c55e] rounded-[24px]" />
          <span className="text-[40px]" style={{ color: tokens.textSecondary }}>
            Start
          </span>
        </div>
        <div className="flex flex-row gap-1 items-center">
          <div className="flex flex-row items-stretch w-[12px] h-[12px] bg-[#f59e0b] rounded-[24px]" />
          <span className="text-[40px]" style={{ color: tokens.textSecondary }}>
            Finish
          </span>
        </div>
        <div className="flex flex-row gap-1 items-center">
          <span className="text-[48px]">⚡</span>
          <span className="text-[40px]" style={{ color: tokens.textSecondary }}>
            Obstacle
          </span>
        </div>
        <div className="flex flex-row gap-1 items-center">
          <span className="text-[48px]">⭐</span>
          <span className="text-[40px]" style={{ color: tokens.textSecondary }}>
            Bonus
          </span>
        </div>
      </div>
    </div>
  );
});

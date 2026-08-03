'use client';

import { memo, useMemo } from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { useCatDashTheme } from '../lib/CatDashThemeContext';
import type { CatDashClientState, CatId } from '../types';

import { RealisticCat } from './RealisticCat';

const CAT_COLORS: Record<CatId, string> = {
  neon: '#a855f7',
  whiskers: '#f59e0b',
  stardust: '#3b82f6',
  felix: '#22c55e',
  shadow: '#6b7280',
  luna: '#ec4899',
};

interface BoardProps {
  snapshot: CatDashClientState;
  disabled: boolean;
  resolveName: (id?: string | null) => string;
}

// Generate serpentine track layout coordinates
function getSerpentineTrackPoint(
  index: number,
  total: number,
  width: number,
  height: number,
  cols: number = 10,
): { x: number; y: number } {
  const rows = Math.ceil(total / cols);
  const row = Math.floor(index / cols);
  const isLeftToRight = row % 2 === 0;
  const col = isLeftToRight ? index % cols : cols - 1 - (index % cols);

  const paddingX = 32;
  const paddingY = 32;

  const innerWidth = width - 2 * paddingX;
  const innerHeight = height - 2 * paddingY;

  const stepX = innerWidth / (cols - 1);
  const stepY = innerHeight / (rows - 1 || 1);

  return {
    x: paddingX + col * stepX,
    y: paddingY + row * stepY,
  };
}

// Generate circular/elliptical track layout coordinates
function getCircularTrackPoint(
  index: number,
  total: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
): { x: number; y: number } {
  const t = (index / total) * 2 * Math.PI - Math.PI / 2;
  return {
    x: cx + rx * Math.cos(t),
    y: cy + ry * Math.sin(t),
  };
}

// Generate figure-8 / infinity track layout coordinates
function getFigure8TrackPoint(
  index: number,
  total: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
): { x: number; y: number } {
  const t = (index / total) * 2 * Math.PI - Math.PI / 2;
  return {
    x: cx + rx * Math.cos(t),
    y: cy + ry * Math.sin(2 * t) * 0.5,
  };
}

export const CatDashBoard = memo(function CatDashBoard({
  snapshot,
  disabled: _disabled,
  resolveName,
}: BoardProps) {
  const { tokens } = useCatDashTheme();

  const total = snapshot.track.length;
  const cols = snapshot.columns || 10;
  const rows = Math.ceil(total / cols);
  const svgW = 560;
  const svgH =
    snapshot.trackType === 'linear' ? Math.max(340, rows * 48 + 48) : 340;
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
    const points = positions.map((p) => `${p.x},${p.y}`);
    const isClosed = snapshot.trackType !== 'linear';
    return `M ${points[0]} ${points
      .slice(1)
      .map((pt) => `L ${pt}`)
      .join(' ')}${isClosed ? ' Z' : ''}`;
  }, [positions, snapshot.trackType]);

  const spaceRadius = 15;

  return (
    <YStack gap="$3" alignItems="center" width="100%" padding="$3">
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
        {/* Background with beautiful radial gradient simulated in SVG */}
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor={`${tokens.track}aa`} />
            <stop offset="100%" stopColor={tokens.background} />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width={svgW} height={svgH} fill="url(#bgGlow)" rx={20} />

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
                  const size = 26;
                  // Shift slightly if multiple players are on the same spot
                  const offsetX = (idx - (playersHere.length - 1) / 2) * 8;
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
      <XStack gap="$3" flexWrap="wrap" justifyContent="center">
        {snapshot.players.map((player) => {
          const isCurrent =
            snapshot.players[snapshot.currentPlayerIndex]?.playerId ===
            player.playerId;
          return (
            <XStack
              key={player.playerId}
              gap="$2"
              alignItems="center"
              opacity={player.isReady ? 1 : 0.4}
              backgroundColor={
                isCurrent ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)'
              }
              paddingHorizontal="$3"
              paddingVertical="$2"
              borderRadius="$4"
              borderWidth={1}
              borderColor={
                isCurrent ? tokens.playerBorder : 'rgba(255,255,255,0.08)'
              }
              style={{
                boxShadow: isCurrent
                  ? `0 0 12px ${tokens.playerBorder}55`
                  : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <RealisticCat catId={player.catId} size={18} />
              <Text
                fontSize={12}
                fontWeight={isCurrent ? 'bold' : 'normal'}
                color={CAT_COLORS[player.catId] ?? tokens.text}
              >
                {resolveName(player.playerId)}
              </Text>
              <Text fontSize={10} color={tokens.textSecondary}>
                🎲 {player.powerTokens}
              </Text>
            </XStack>
          );
        })}
      </XStack>

      {/* Legend */}
      <XStack gap="$3" justifyContent="center" flexWrap="wrap">
        <XStack gap="$1" alignItems="center">
          <XStack
            width={12}
            height={12}
            backgroundColor="#22c55e"
            borderRadius={6}
          />
          <Text fontSize={9} color={tokens.textSecondary}>
            Start
          </Text>
        </XStack>
        <XStack gap="$1" alignItems="center">
          <XStack
            width={12}
            height={12}
            backgroundColor="#f59e0b"
            borderRadius={6}
          />
          <Text fontSize={9} color={tokens.textSecondary}>
            Finish
          </Text>
        </XStack>
        <XStack gap="$1" alignItems="center">
          <Text fontSize={10}>⚡</Text>
          <Text fontSize={9} color={tokens.textSecondary}>
            Obstacle
          </Text>
        </XStack>
        <XStack gap="$1" alignItems="center">
          <Text fontSize={10}>⭐</Text>
          <Text fontSize={9} color={tokens.textSecondary}>
            Bonus
          </Text>
        </XStack>
      </XStack>
    </YStack>
  );
});

'use client';

import { memo, useMemo } from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { useCatDashTheme } from '../lib/CatDashThemeContext';
import type { CatDashClientState } from '../types';

import { RealisticCat } from './RealisticCat';
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

  const spaceRadius = 18;

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

          {/* Glowing cyber grid pattern for Neon Cyber */}
          <pattern
            id="cyberGrid"
            width="30"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 30 0 L 0 0 0 30"
              fill="none"
              stroke={tokens.trackBorder}
              strokeWidth="0.5"
              opacity="0.1"
            />
          </pattern>

          {/* Cosmic star coordinates for Space Cats */}
          <pattern
            id="spaceStars"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="20" cy="20" r="1.2" fill="#ffffff" opacity="0.25" />
            <circle cx="80" cy="35" r="1.8" fill="#ffffff" opacity="0.45" />
            <circle cx="45" cy="75" r="0.8" fill="#ffffff" opacity="0.2" />
            <circle cx="70" cy="85" r="1.4" fill="#ffffff" opacity="0.35" />
            <path
              d="M 50 15 L 52 20 L 57 20 L 53 23 L 55 28 L 50 25 L 45 28 L 47 23 L 43 20 L 48 20 Z"
              fill="#ffffff"
              opacity="0.08"
              transform="scale(0.5) translate(50, 50)"
            />
          </pattern>

          {/* Cozy cobblestone pattern for Classic Village */}
          <pattern
            id="villageTiles"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 0 20 Q 10 10 20 20 T 40 20 M 0 40 Q 10 30 20 40 T 40 40"
              fill="none"
              stroke={tokens.trackBorder}
              strokeWidth="0.8"
              opacity="0.08"
            />
          </pattern>

          {/* Organic leaf pattern for Nature Wild */}
          <pattern
            id="natureLeaves"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 10 20 Q 20 15 20 30 Q 20 45 10 40 Q 0 45 0 30 Q 0 15 10 20 Z"
              fill="none"
              stroke={tokens.trackBorder}
              strokeWidth="0.8"
              opacity="0.06"
              transform="scale(0.6) translate(10, 10)"
            />
            <path
              d="M 40 45 Q 50 40 50 50 Q 50 60 40 55 Q 30 60 30 50 Q 30 40 40 45 Z"
              fill="none"
              stroke={tokens.trackBorder}
              strokeWidth="0.8"
              opacity="0.06"
              transform="scale(0.6) translate(30, 20)"
            />
          </pattern>
        </defs>
        <rect width={svgW} height={svgH} fill="url(#bgGlow)" rx={20} />
        {variant === 'neon' && (
          <rect
            width={svgW}
            height={svgH}
            fill="url(#cyberGrid)"
            rx={20}
            pointerEvents="none"
          />
        )}
        {variant === 'space' && (
          <rect
            width={svgW}
            height={svgH}
            fill="url(#spaceStars)"
            rx={20}
            pointerEvents="none"
          />
        )}
        {variant === 'village' && (
          <rect
            width={svgW}
            height={svgH}
            fill="url(#villageTiles)"
            rx={20}
            pointerEvents="none"
          />
        )}
        {variant === 'nature' && (
          <rect
            width={svgW}
            height={svgH}
            fill="url(#natureLeaves)"
            rx={20}
            pointerEvents="none"
          />
        )}

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
                  const size = 32;
                  // Shift slightly if multiple players are on the same spot
                  const offsetX = (idx - (playersHere.length - 1) / 2) * 10;
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
              gap="$2.5"
              alignItems="center"
              opacity={player.isReady ? 1 : 0.4}
              backgroundColor={
                isCurrent ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)'
              }
              paddingHorizontal="$3.5"
              paddingVertical="$2.5"
              borderRadius="$4"
              borderWidth={1.5}
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
              <RealisticCat catId={player.catId} size={22} />
              <Text
                fontSize={13}
                fontWeight={isCurrent ? 'bold' : 'normal'}
                color={CAT_COLORS[player.catId] ?? tokens.text}
              >
                {resolveName(player.playerId)}
              </Text>
              <Text fontSize={11} color={tokens.textSecondary}>
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

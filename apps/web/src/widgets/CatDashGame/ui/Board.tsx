'use client';

import { memo, useMemo } from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { useCatDashTheme } from '../lib/CatDashThemeContext';
import type { CatDashClientState, CatId } from '../types';

const CAT_EMOJI: Record<CatId, string> = {
  neon: '🐱',
  whiskers: '😺',
  stardust: '✨',
  felix: '🐈',
  shadow: '🐈‍⬛',
  luna: '🌙',
};

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

function getOvalPoint(
  index: number,
  total: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
): { x: number; y: number } {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  return {
    x: cx + rx * Math.cos(angle),
    y: cy + ry * Math.sin(angle),
  };
}

export const CatDashBoard = memo(function CatDashBoard({
  snapshot,
  disabled: _disabled,
  resolveName,
}: BoardProps) {
  const { tokens } = useCatDashTheme();

  const total = snapshot.track.length;
  const svgW = 560;
  const svgH = 340;
  const cx = svgW / 2;
  const cy = svgH / 2;
  const rx = svgW * 0.42;
  const ry = svgH * 0.4;

  const positions = useMemo(
    () => snapshot.track.map((_, i) => getOvalPoint(i, total, cx, cy, rx, ry)),
    [snapshot.track, total, cx, cy, rx, ry],
  );

  const spaceRadius = 12;

  return (
    <YStack gap="$3" alignItems="center" width="100%" padding="$3">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        width="100%"
        style={{ maxWidth: svgW, borderRadius: 16, overflow: 'hidden' }}
      >
        {/* Background */}
        <rect width={svgW} height={svgH} fill={tokens.track} rx={16} />

        {/* Track path line */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill="none"
          stroke={tokens.trackBorder}
          strokeWidth={spaceRadius * 2 + 6}
          opacity={0.15}
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
              {/* Space circle */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={spaceRadius}
                fill={fill}
                stroke={
                  isOccupied ? tokens.playerBorder : 'rgba(255,255,255,0.08)'
                }
                strokeWidth={isOccupied ? 2.5 : 1}
              />

              {/* Space number (every 5th) */}
              {i % 5 === 0 && !isOccupied && (
                <text
                  x={pos.x}
                  y={pos.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={7}
                  fill={tokens.textSecondary}
                  opacity={0.4}
                >
                  {i}
                </text>
              )}

              {/* Player cat emoji */}
              {isOccupied &&
                playersHere.map((p) => (
                  <text
                    key={p.playerId}
                    x={pos.x}
                    y={pos.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={14}
                  >
                    {CAT_EMOJI[p.catId] ?? '🐱'}
                  </text>
                ))}

              {/* Start / Finish labels */}
              {isStart && (
                <text
                  x={pos.x}
                  y={pos.y - spaceRadius - 6}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight="bold"
                  fill="#22c55e"
                >
                  START
                </text>
              )}
              {isFinish && (
                <text
                  x={pos.x}
                  y={pos.y - spaceRadius - 6}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight="bold"
                  fill="#f59e0b"
                >
                  🏁 FINISH
                </text>
              )}

              {/* Obstacle / Bonus icons */}
              {!isOccupied &&
                !isStart &&
                !isFinish &&
                space.type !== 'normal' && (
                  <text
                    x={pos.x}
                    y={pos.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={8}
                  >
                    {space.type === 'obstacle'
                      ? '⚡'
                      : space.type === 'bonus'
                        ? '⭐'
                        : '🔀'}
                  </text>
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
              gap="$1"
              alignItems="center"
              opacity={player.isReady ? 1 : 0.4}
              backgroundColor={
                isCurrent ? 'rgba(124,58,237,0.15)' : 'transparent'
              }
              paddingHorizontal="$2"
              paddingVertical="$1"
              borderRadius="$3"
              borderWidth={isCurrent ? 1 : 0}
              borderColor={isCurrent ? tokens.playerBorder : 'transparent'}
            >
              <Text fontSize={16}>{CAT_EMOJI[player.catId] ?? '🐱'}</Text>
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

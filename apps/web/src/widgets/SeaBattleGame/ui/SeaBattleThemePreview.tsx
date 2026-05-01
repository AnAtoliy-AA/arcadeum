'use client';

import React from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { useSeaBattleTheme } from '../lib/SeaBattleThemeContext';
import { CELL_STATE } from '../types';

// Pre-set 10×10 pattern: 0=empty 1=ship 2=hit 3=miss
const BOARD_PATTERN: number[] = [
  1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 2, 0, 0, 0, 0, 1, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 3, 0, 0,
];

const COL_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const ROW_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

interface SeaBattleThemePreviewProps {
  selectedVariant: string;
}

export function SeaBattleThemePreview({
  selectedVariant,
}: SeaBattleThemePreviewProps) {
  const theme = useSeaBattleTheme();

  function getCellColor(state: number): string {
    switch (state) {
      case CELL_STATE.SHIP:
        return theme.shipColor;
      case CELL_STATE.HIT:
        return theme.hitColor;
      case CELL_STATE.MISS:
        return theme.missColor;
      default:
        return theme.cellEmpty;
    }
  }

  return (
    <YStack
      key={selectedVariant}
      className="sb-preview-fade"
      borderRadius={10}
      borderWidth={1}
      borderColor={theme.cellBorder}
      padding="$3"
      gap="$2"
      data-testid="color-preview-container"
      style={{ background: theme.boardBackground } as React.CSSProperties}
    >
      {/* Column labels */}
      <XStack marginLeft={16} gap={2}>
        {COL_LABELS.map((l) => (
          <Text
            key={l}
            fontSize={8}
            color={theme.textSecondaryColor}
            width={20}
            textAlign="center"
          >
            {l}
          </Text>
        ))}
      </XStack>

      {/* Rows */}
      {Array.from({ length: 10 }, (_, rIndex) => (
        <XStack key={rIndex} gap={2} alignItems="center">
          <Text
            fontSize={8}
            color={theme.textSecondaryColor}
            width={14}
            textAlign="right"
          >
            {ROW_LABELS[rIndex]}
          </Text>
          {Array.from({ length: 10 }, (_, cIndex) => {
            const state = BOARD_PATTERN[rIndex * 10 + cIndex];
            // Preserve data-testid compatibility with sea-battle-lobby-colors.spec.ts
            const testId =
              rIndex === 0 && cIndex === 0
                ? 'color-swatch-ship'
                : rIndex === 5 && cIndex === 3
                  ? 'color-swatch-hit'
                  : rIndex === 9 && cIndex === 7
                    ? 'color-swatch-miss'
                    : rIndex === 0 && cIndex === 4
                      ? 'color-swatch-empty'
                      : undefined;
            return (
              <YStack
                key={cIndex}
                width={20}
                height={20}
                borderRadius={parseInt(theme.borderRadius) || 3}
                borderWidth={1}
                borderColor={theme.cellBorder}
                backgroundColor={getCellColor(state ?? 0)}
                alignItems="center"
                justifyContent="center"
                data-testid={testId}
              >
                {state === CELL_STATE.HIT && (
                  <Text
                    fontSize={10}
                    style={{ pointerEvents: 'none' } as React.CSSProperties}
                  >
                    🔥
                  </Text>
                )}
                {state === CELL_STATE.MISS && (
                  <YStack
                    width={8}
                    height={8}
                    borderRadius={100}
                    backgroundColor="rgba(255,255,255,0.55)"
                  />
                )}
              </YStack>
            );
          })}
        </XStack>
      ))}
    </YStack>
  );
}

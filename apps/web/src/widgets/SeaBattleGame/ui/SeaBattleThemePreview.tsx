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
  /** Cell width/height in px. Labels + glyphs scale proportionally. */
  cellSize?: number;
}

export function SeaBattleThemePreview({
  selectedVariant,
  cellSize = 20,
}: SeaBattleThemePreviewProps) {
  const theme = useSeaBattleTheme();

  // Proportional sizing — keeps the lobby preview pixel-identical at the
  // default 20px cell, but lets bigger consumers (e.g. the SEO landing
  // hero) scale up cells, labels, and the miss/hit glyphs without
  // resorting to CSS transform.
  const labelFontSize = Math.max(8, Math.round(cellSize * 0.4));
  const colLabelOffset = Math.round(cellSize * 0.8);
  const rowLabelWidth = Math.max(12, Math.round(cellSize * 0.7));
  const hitFontSize = Math.round(cellSize * 0.5);
  const missDotSize = Math.round(cellSize * 0.4);

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
      <XStack marginLeft={colLabelOffset} gap={2}>
        {COL_LABELS.map((l) => (
          <Text
            key={l}
            fontSize={labelFontSize}
            color={theme.textSecondaryColor}
            width={cellSize}
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
            fontSize={labelFontSize}
            color={theme.textSecondaryColor}
            width={rowLabelWidth}
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
                width={cellSize}
                height={cellSize}
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
                    fontSize={hitFontSize}
                    style={{ pointerEvents: 'none' } as React.CSSProperties}
                  >
                    🔥
                  </Text>
                )}
                {state === CELL_STATE.MISS && (
                  <YStack
                    width={missDotSize}
                    height={missDotSize}
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

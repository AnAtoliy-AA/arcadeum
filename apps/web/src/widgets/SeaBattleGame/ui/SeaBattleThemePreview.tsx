'use client';

import React from 'react';
import { useSeaBattleTheme } from '../lib/SeaBattleThemeContext';
import { CELL_STATE } from '../types';

// Pre-set 10×10 pattern: 0=empty 1=ship 2=hit 3=miss
// All ships placed as in real game (1×4, 2×3, 3×2, 4×1).
// Cruiser at (3,3)-(3,5) is sunk — all cells hits, full 8-dir surround as misses.
const BOARD_PATTERN: number[] = [
  0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1, 0, 0, 1, 1, 3, 3, 3, 3,
  3, 1, 0, 0, 0, 0, 3, 2, 2, 2, 3, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 0, 0, 0, 0, 1,
  1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 3,
  0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 3, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0,
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
    <div
      className="flex flex-col items-stretch rounded-[10px] border p-3 gap-2 sb-preview-fade"
      style={{ borderColor: theme.cellBorder }}
      key={selectedVariant}
      data-testid="color-preview-container"
    >
      {/* Column labels */}
      <div
        className="flex flex-row items-stretch gap-2"
        style={{ marginLeft: colLabelOffset }}
      >
        {COL_LABELS.map((l) => (
          <span
            className="text-center"
            style={{
              fontSize: labelFontSize,
              color: theme.textSecondaryColor,
              width: cellSize,
            }}
            key={l}
          >
            {l}
          </span>
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: 10 }, (_, rIndex) => (
        <div className="flex flex-row gap-2 items-center" key={rIndex}>
          <span
            className="text-right"
            style={{
              fontSize: labelFontSize,
              color: theme.textSecondaryColor,
              width: rowLabelWidth,
            }}
          >
            {ROW_LABELS[rIndex]}
          </span>
          {Array.from({ length: 10 }, (_, cIndex) => {
            const state = BOARD_PATTERN[rIndex * 10 + cIndex];
            // Preserve data-testid compatibility with sea-battle-lobby-colors.spec.ts
            const testId =
              rIndex === 0 && cIndex === 2
                ? 'color-swatch-ship'
                : rIndex === 3 && cIndex === 3
                  ? 'color-swatch-hit'
                  : rIndex === 4 && cIndex === 3
                    ? 'color-swatch-miss'
                    : rIndex === 0 && cIndex === 0
                      ? 'color-swatch-empty'
                      : undefined;
            return (
              <div
                className="flex flex-col border items-center justify-center"
                style={{
                  width: cellSize,
                  height: cellSize,
                  borderRadius: parseInt(theme.borderRadius) || 3,
                  borderColor: theme.cellBorder,
                  backgroundColor: getCellColor(state ?? 0),
                }}
                key={cIndex}
                data-testid={testId}
              >
                {state === CELL_STATE.HIT && (
                  <span className="" style={{ fontSize: hitFontSize }}>
                    🔥
                  </span>
                )}
                {state === CELL_STATE.MISS && (
                  <div
                    className="flex flex-col items-stretch rounded-[100px] opacity-[0.7]"
                    style={{
                      width: missDotSize,
                      height: missDotSize,
                      backgroundColor: theme.textSecondaryColor,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

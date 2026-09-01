'use client';

import React from 'react';
import { useSeaBattleTheme } from '../lib/SeaBattleThemeContext';
import { CELL_STATE } from '../types';

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
  cellSize?: number;
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
    <div
      className="sb-preview-board sb-preview-fade select-none"
      key={selectedVariant}
      data-testid="color-preview-container"
    >
      <div className="sb-board-with-labels-layout">
        <div />
        <div
          className="sb-col-labels"
          style={{ '--sb-grid-size': 10 } as React.CSSProperties}
        >
          {COL_LABELS.map((l) => (
            <div
              className="sb-label"
              key={l}
              style={{ color: theme.textSecondaryColor }}
            >
              {l}
            </div>
          ))}
        </div>
        <div
          className="sb-row-labels"
          style={{ '--sb-grid-size': 10 } as React.CSSProperties}
        >
          {ROW_LABELS.map((l) => (
            <div
              className="sb-label"
              key={l}
              style={{ color: theme.textSecondaryColor }}
            >
              {l}
            </div>
          ))}
        </div>
        <div
          className="sb-board-grid-layout"
          style={
            {
              '--sb-grid-size': 10,
              backgroundColor: theme.boardBackground,
              borderColor: theme.cellBorder,
            } as React.CSSProperties
          }
        >
          {Array.from({ length: 100 }, (_, idx) => {
            const rIndex = Math.floor(idx / 10);
            const cIndex = idx % 10;
            const state = BOARD_PATTERN[idx];
            const isShip = state === CELL_STATE.SHIP;
            const isHit = state === CELL_STATE.HIT;
            const isMiss = state === CELL_STATE.MISS;

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
                key={`${rIndex}-${cIndex}`}
                className="sb-cell flex items-center justify-center relative"
                style={{
                  backgroundColor: getCellColor(state ?? 0),
                  borderColor: isShip ? '#64748b' : theme.cellBorder,
                  borderRadius: parseInt(theme.borderRadius) || 2,
                  boxShadow: isShip
                    ? 'inset 0 1px 0 rgba(255,255,255,0.2), 0 1px 3px rgba(0,0,0,0.5)'
                    : undefined,
                }}
                data-testid={testId}
              >
                {isShip && (
                  <div className="w-[3px] h-[3px] rounded-full bg-[#cbd5e1] opacity-75 shadow-sm pointer-events-none" />
                )}
                {isHit && (
                  <span className="text-[10px] select-none pointer-events-none leading-none">
                    🔥
                  </span>
                )}
                {isMiss && (
                  <div
                    className="w-[3px] h-[3px] rounded-full opacity-70 pointer-events-none"
                    style={{ backgroundColor: theme.textSecondaryColor }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

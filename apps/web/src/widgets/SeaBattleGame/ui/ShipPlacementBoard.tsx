'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import type {
  ShipCell,
  ShipConfig,
  SeaBattlePlayerState,
  CellState,
} from '../types';
import {
  SHIPS,
  BOARD_SIZE,
  CELL_STATE,
  ROW_LABELS,
  COL_LABELS,
} from '../types';
import {
  BoardGrid,
  BoardCell,
  BoardWithLabels,
  RowLabels,
  ColLabels,
  Label,
  ShipPalette,
  ShipItem,
  ShipPreview,
  ShipCell as ShipCellStyled,
  ShipName,
  ActionButton,
  PlacementHeader,
  PlacementControls,
  RotateButton,
  PlayerSection,
  PlayerName,
} from './styles';
import { getTheme } from '../lib/theme';

interface ShipPlacementBoardProps {
  currentPlayer: SeaBattlePlayerState | null;
  onPlaceShip: (shipId: string, cells: ShipCell[]) => void;
  onConfirmPlacement: () => void;
  onResetPlacement: () => void;
  isPlacementComplete: boolean;
  onAutoPlace?: () => void;
}

export function ShipPlacementBoard({
  currentPlayer,
  onPlaceShip,
  onConfirmPlacement,
  onResetPlacement,
  isPlacementComplete,
  onAutoPlace,
  variant = 'classic',
}: ShipPlacementBoardProps & { variant?: string }) {
  const [selectedShipId, setSelectedShipId] = useState<string | null>(null);
  const [isVertical, setIsVertical] = useState(false);
  const [hoveredCells, setHoveredCells] = useState<ShipCell[]>([]);
  const { t } = useTranslation();
  const theme = getTheme(variant);

  const placedShipIds = useMemo(() => {
    return new Set(currentPlayer?.ships.map((s) => s.id) || []);
  }, [currentPlayer?.ships]);

  const unplacedShips = useMemo(() => {
    return SHIPS.filter((s) => !placedShipIds.has(s.id));
  }, [placedShipIds]);

  const board = currentPlayer?.board || createEmptyBoard();

  const selectedShip = useMemo(() => {
    return SHIPS.find((s) => s.id === selectedShipId) || null;
  }, [selectedShipId]);

  const canPlaceAt = useCallback(
    (row: number, col: number, ship: ShipConfig): boolean => {
      if (!ship) return false;

      const cells = getCellsForPlacement(row, col, ship.size, isVertical);
      if (!cells) return false;

      // Check if all cells are empty and not adjacent to other ships
      for (const cell of cells) {
        if (board[cell.row]?.[cell.col] !== CELL_STATE.EMPTY) {
          return false;
        }

        // Check surrounding cells
        const directions = [
          [-1, -1],
          [-1, 0],
          [-1, 1],
          [0, -1],
          [0, 1],
          [1, -1],
          [1, 0],
          [1, 1],
        ];

        for (const [dr, dc] of directions) {
          const r = cell.row + dr;
          const c = cell.col + dc;
          if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
            if (board[r][c] === CELL_STATE.SHIP) {
              return false;
            }
          }
        }
      }

      return true;
    },
    [board, isVertical],
  );

  const handleCellHover = useCallback(
    (row: number, col: number) => {
      if (!selectedShip) {
        setHoveredCells([]);
        return;
      }

      const cells = getCellsForPlacement(
        row,
        col,
        selectedShip.size,
        isVertical,
      );
      if (cells && canPlaceAt(row, col, selectedShip)) {
        setHoveredCells(cells);
      } else {
        setHoveredCells([]);
      }
    },
    [selectedShip, isVertical, canPlaceAt],
  );

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (!selectedShip || !canPlaceAt(row, col, selectedShip)) return;

      const cells = getCellsForPlacement(
        row,
        col,
        selectedShip.size,
        isVertical,
      );
      if (!cells) return;

      onPlaceShip(selectedShip.id, cells);
      setSelectedShipId(null);
      setHoveredCells([]);
    },
    [selectedShip, isVertical, canPlaceAt, onPlaceShip],
  );

  const handleRotate = useCallback(() => {
    setIsVertical((prev) => !prev);
  }, []);

  const isAllShipsPlaced = unplacedShips.length === 0;

  return (
    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
      <div>
        <PlacementHeader>
          <h2 style={{ margin: 0, color: theme.textColor }}>
            Place Your Ships
          </h2>
          <PlacementControls>
            <RotateButton
              $theme={theme}
              onClick={handleRotate}
              disabled={!selectedShip}
            >
              Rotate ({isVertical ? 'Vertical' : 'Horizontal'})
            </RotateButton>
          </PlacementControls>
        </PlacementHeader>

        <PlayerSection $isMe $isActive={false} $theme={theme}>
          <PlayerName $theme={theme}>Your Board</PlayerName>
          <BoardWithLabels>
            <div /> {/* Empty corner */}
            <ColLabels>
              {COL_LABELS.map((label) => (
                <Label key={label} $theme={theme}>
                  {label}
                </Label>
              ))}
            </ColLabels>
            <RowLabels>
              {ROW_LABELS.map((label) => (
                <Label key={label} $theme={theme}>
                  {label}
                </Label>
              ))}
            </RowLabels>
            <BoardGrid $theme={theme} onMouseLeave={() => setHoveredCells([])}>
              {board.map((row, rIndex) =>
                row.map((cellState, cIndex) => {
                  const isHovered = hoveredCells.some(
                    (c) => c.row === rIndex && c.col === cIndex,
                  );
                  return (
                    <BoardCell
                      key={`${rIndex}-${cIndex}`}
                      $state={cellState}
                      $isClickable={!!selectedShip}
                      $isHighlighted={isHovered}
                      $theme={theme}
                      onMouseEnter={() => handleCellHover(rIndex, cIndex)}
                      onClick={() => handleCellClick(rIndex, cIndex)}
                    />
                  );
                }),
              )}
            </BoardGrid>
          </BoardWithLabels>
        </PlayerSection>
      </div>

      <ShipPalette $theme={theme}>
        <h3 style={{ margin: '0 0 12px', color: theme.textColor }}>
          Ships to Place
        </h3>
        {SHIPS.map((ship) => {
          const isPlaced = placedShipIds.has(ship.id);
          const isSelected = selectedShipId === ship.id;

          return (
            <ShipItem
              key={ship.id}
              $size={ship.size}
              $isPlaced={isPlaced}
              $isSelected={isSelected}
              $theme={theme}
              onClick={() =>
                !isPlaced && setSelectedShipId(isSelected ? null : ship.id)
              }
            >
              <ShipPreview $size={ship.size}>
                {Array(ship.size)
                  .fill(null)
                  .map((_, i) => (
                    <ShipCellStyled key={i} $theme={theme} />
                  ))}
              </ShipPreview>
              <ShipName $theme={theme}>
                {ship.name} ({ship.size}){isPlaced && ' ✓'}
              </ShipName>
            </ShipItem>
          );
        })}

        <ActionButton
          $variant="primary"
          $theme={theme}
          disabled={!isAllShipsPlaced || isPlacementComplete}
          onClick={onConfirmPlacement}
          style={{ marginTop: '16px' }}
        >
          {isPlacementComplete
            ? t('games.seaBattle.table.actions.waitingForOthers')
            : t('games.seaBattle.table.actions.confirmPlacement')}
        </ActionButton>
        {placedShipIds.size > 0 && !isPlacementComplete && (
          <ActionButton
            $variant="secondary"
            $theme={theme}
            onClick={onResetPlacement}
            style={{ marginTop: '8px' }}
          >
            {t('games.seaBattle.table.actions.resetPlacement')}
          </ActionButton>
        )}
        {!isPlacementComplete && onAutoPlace && (
          <ActionButton
            $variant="secondary"
            $theme={theme}
            onClick={onAutoPlace}
            style={{ marginTop: '8px' }}
          >
            {placedShipIds.size > 0
              ? t('games.seaBattle.table.actions.randomize')
              : t('games.seaBattle.table.actions.autoPlace')}
          </ActionButton>
        )}
      </ShipPalette>
    </div>
  );
}

// Helper functions
function createEmptyBoard(): CellState[][] {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(CELL_STATE.EMPTY));
}

function getCellsForPlacement(
  startRow: number,
  startCol: number,
  size: number,
  isVertical: boolean,
): ShipCell[] | null {
  const cells: ShipCell[] = [];

  for (let i = 0; i < size; i++) {
    const row = isVertical ? startRow + i : startRow;
    const col = isVertical ? startCol : startCol + i;

    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
      return null;
    }

    cells.push({ row, col });
  }

  return cells;
}

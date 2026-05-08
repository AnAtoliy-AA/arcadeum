'use client';

import { useState, useCallback, useMemo, memo } from 'react';
import { Text, YStack, useMedia } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import type {
  ShipCell,
  ShipConfig,
  SeaBattlePlayerState,
  CellState,
} from '../types';
import { SHIPS, BOARD_SIZE, CELL_STATE } from '../types';
import { PlacementHeader, GameBoardWrapper, BoardContainer } from './styles';
import { useSeaBattleTheme } from '../lib/SeaBattleThemeContext';
import { useDragPlacement } from '../hooks/useDragPlacement';

interface ShipPlacementBoardProps {
  currentPlayer: SeaBattlePlayerState | null;
  onPlaceShip: (shipId: string, cells: ShipCell[]) => void;
  onConfirmPlacement: () => void;
  onResetPlacement: () => void;
  isPlacementComplete: boolean;
  onAutoPlace?: () => void;
}

import { ShipPaletteSection } from './ShipPlacement/ShipPaletteSection';
import { PlacementActionsSection } from './ShipPlacement/PlacementActionsSection';
import { PlacementBoardGrid } from './ShipPlacement/PlacementBoardGrid';

export const ShipPlacementBoard = memo(function ShipPlacementBoard({
  currentPlayer,
  onPlaceShip,
  onConfirmPlacement,
  onResetPlacement,
  isPlacementComplete,
  onAutoPlace,
}: ShipPlacementBoardProps) {
  const [selectedShipId, setSelectedShipId] = useState<string | null>(null);
  const [isVertical, setIsVertical] = useState(false);
  const [hoveredCells, setHoveredCells] = useState<ShipCell[]>([]);
  const [isInvalidHover, setIsInvalidHover] = useState(false);
  const { t } = useTranslation();
  const theme = useSeaBattleTheme();

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

  const { getDragProps, onDragOver, onDrop, onDragLeave, handleDragEnd } =
    useDragPlacement({
      board,
      isVertical,
      placedShipIds,
      onPlaceShip,
      setSelectedShipId,
      setHoveredCells,
      setIsInvalidHover,
    });

  const canPlaceAt = useCallback(
    (row: number, col: number, ship: ShipConfig): boolean => {
      if (!ship) return false;

      const cells = getCellsForPlacement(row, col, ship.size, isVertical);
      if (!cells) return false;

      for (const cell of cells) {
        if (board[cell.row]?.[cell.col] !== CELL_STATE.EMPTY) {
          return false;
        }

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
          const r = cell.row + (dr ?? 0);
          const c = cell.col + (dc ?? 0);
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
        setIsInvalidHover(false);
        return;
      }

      const cells = getCellsForPlacement(
        row,
        col,
        selectedShip.size,
        isVertical,
      );

      if (!cells) {
        setHoveredCells([]);
        setIsInvalidHover(false);
        return;
      }

      if (canPlaceAt(row, col, selectedShip)) {
        setHoveredCells(cells);
        setIsInvalidHover(false);
      } else {
        setHoveredCells(cells);
        setIsInvalidHover(true);
      }
    },
    [selectedShip, isVertical, canPlaceAt],
  );

  const handleMouseLeave = useCallback(() => {
    handleCellHover(-1, -1);
    setIsInvalidHover(false);
  }, [handleCellHover]);

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

      // Auto-select next unplaced ship so mobile users don't need to scroll back
      const nextShip = SHIPS.find(
        (s) => s.id !== selectedShip.id && !placedShipIds.has(s.id),
      );
      setSelectedShipId(nextShip?.id ?? null);
      setHoveredCells([]);
      setIsInvalidHover(false);
    },
    [selectedShip, isVertical, canPlaceAt, onPlaceShip, placedShipIds],
  );

  const handleRotate = useCallback(() => {
    setIsVertical((prev) => !prev);
  }, []);

  const isAllShipsPlaced = unplacedShips.length === 0;
  const media = useMedia();
  const isMobile = !media.gtMd;

  const shipPaletteEl = (
    <ShipPaletteSection
      theme={theme}
      isMobile={isMobile}
      placedShipIds={placedShipIds}
      selectedShipId={selectedShipId}
      setSelectedShipId={setSelectedShipId}
      getDragProps={getDragProps}
      t={t}
    />
  );

  const actionsEl = (
    <PlacementActionsSection
      isMobile={isMobile}
      selectedShip={selectedShip}
      isVertical={isVertical}
      isAllShipsPlaced={isAllShipsPlaced}
      isPlacementComplete={isPlacementComplete}
      placedShipIdsSize={placedShipIds.size}
      onRotate={handleRotate}
      onConfirm={onConfirmPlacement}
      onReset={onResetPlacement}
      onAutoPlace={onAutoPlace}
      t={t}
    />
  );

  const boardEl = (
    <PlacementBoardGrid
      board={board}
      theme={theme}
      hoveredCells={hoveredCells}
      isInvalidHover={isInvalidHover}
      selectedShip={selectedShip}
      onCellHover={handleCellHover}
      onMouseLeave={handleMouseLeave}
      onCellClick={handleCellClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
      t={t}
    />
  );

  // Mobile: compact palette + actions above board so buttons don't overlap the grid
  // Desktop: palette beside board, actions below
  if (isMobile) {
    return (
      <YStack
        width="100%"
        gap="$2"
        onDragEnd={handleDragEnd}
        paddingHorizontal="$1"
      >
        {shipPaletteEl}
        {actionsEl}
        <BoardContainer alignSelf="center">{boardEl}</BoardContainer>
      </YStack>
    );
  }

  return (
    <YStack width="100%" gap="$4">
      <GameBoardWrapper onDragEnd={handleDragEnd}>
        <BoardContainer>
          <PlacementHeader className="placement-header">
            <Text
              data-testid="placement-instruction"
              color={theme.textColor}
              fontSize="$5"
              fontWeight="700"
              margin={0}
              className="placement-title"
            >
              {t('games.sea_battle_v1.table.players.placeShips')}
            </Text>
          </PlacementHeader>
          {boardEl}
        </BoardContainer>
        {shipPaletteEl}
      </GameBoardWrapper>
      {actionsEl}
    </YStack>
  );
});
ShipPlacementBoard.displayName = 'ShipPlacementBoard';

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

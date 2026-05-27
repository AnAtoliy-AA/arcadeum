'use client';

import { useState, useCallback, useMemo, useEffect, memo } from 'react';
import { Text, YStack, useMedia } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import type {
  ShipCell,
  ShipConfig,
  SeaBattlePlayerState,
  CellState,
  Ship,
} from '../types';
import { SHIPS, BOARD_SIZE, CELL_STATE } from '../types';
import { PlacementHeader, GameBoardWrapper, BoardContainer } from './styles';
import { useSeaBattleTheme } from '../lib/SeaBattleThemeContext';
import { useDragPlacement } from '../hooks/useDragPlacement';

interface ShipPlacementBoardProps {
  currentPlayer: SeaBattlePlayerState | null;
  onPlaceShip: (shipId: string, cells: ShipCell[]) => void;
  onMoveShip: (shipId: string, cells: ShipCell[]) => void;
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
  onMoveShip,
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

  const serverShips = useMemo<Ship[]>(
    () => currentPlayer?.ships ?? [],
    [currentPlayer?.ships],
  );
  const serverBoard = useMemo<CellState[][]>(
    () => currentPlayer?.board || createEmptyBoard(),
    [currentPlayer?.board],
  );

  // Optimistic move: when the player drops a ship, render it at the new spot
  // immediately while the server round-trip is in flight. The pending state
  // is treated as "effective" only while the server hasn't yet reflected the
  // move — derived in render so we never call setState from an effect.
  // A 2s safety timer clears the underlying state if no server update arrives
  // (e.g. dropped socket, server-side rejection that produces no broadcast).
  const [pendingMove, setPendingMove] = useState<{
    shipId: string;
    originalCells: ShipCell[];
    newCells: ShipCell[];
  } | null>(null);

  const effectivePendingMove = useMemo(() => {
    if (!pendingMove) return null;
    const ship = serverShips.find((s) => s.id === pendingMove.shipId);
    if (!ship) return pendingMove;
    const matchesNew =
      ship.cells.length === pendingMove.newCells.length &&
      ship.cells.every(
        (c, i) =>
          c.row === pendingMove.newCells[i].row &&
          c.col === pendingMove.newCells[i].col,
      );
    return matchesNew ? null : pendingMove;
  }, [serverShips, pendingMove]);

  const ships = useMemo<Ship[]>(() => {
    if (!effectivePendingMove) return serverShips;
    return serverShips.map((s) =>
      s.id === effectivePendingMove.shipId
        ? { ...s, cells: effectivePendingMove.newCells }
        : s,
    );
  }, [serverShips, effectivePendingMove]);

  const board = useMemo<CellState[][]>(() => {
    if (!effectivePendingMove) return serverBoard;
    const next = serverBoard.map((row) => row.slice());
    for (const c of effectivePendingMove.originalCells) {
      next[c.row][c.col] = CELL_STATE.EMPTY;
    }
    for (const c of effectivePendingMove.newCells) {
      next[c.row][c.col] = CELL_STATE.SHIP;
    }
    return next;
  }, [serverBoard, effectivePendingMove]);

  useEffect(() => {
    if (!pendingMove) return;
    const timer = setTimeout(() => setPendingMove(null), 2000);
    return () => clearTimeout(timer);
  }, [pendingMove]);

  const handleMoveShip = useCallback(
    (shipId: string, cells: ShipCell[]) => {
      const ship = serverShips.find((s) => s.id === shipId);
      if (ship) {
        setPendingMove({
          shipId,
          originalCells: ship.cells,
          newCells: cells,
        });
      }
      onMoveShip(shipId, cells);
    },
    [serverShips, onMoveShip],
  );

  const placedShipIds = useMemo(() => {
    return new Set(ships.map((s) => s.id));
  }, [ships]);

  const unplacedShips = useMemo(() => {
    return SHIPS.filter((s) => !placedShipIds.has(s.id));
  }, [placedShipIds]);

  const selectedShip = useMemo(() => {
    return SHIPS.find((s) => s.id === selectedShipId) || null;
  }, [selectedShipId]);

  const {
    getDragProps,
    getBoardCellDragProps,
    onDragOver,
    onDrop,
    onDragLeave,
    handleDragEnd,
    draggingCells,
  } = useDragPlacement({
    board,
    isVertical,
    placedShipIds,
    ships,
    placementComplete: isPlacementComplete,
    onPlaceShip,
    onMoveShip: handleMoveShip,
    setSelectedShipId,
    setHoveredCells,
    setIsInvalidHover,
  });

  // Rotate a placed ship in place around the clicked cell. Keeps the clicked
  // cell as the anchor and flips orientation; falls back silently if the
  // rotated layout would be invalid (out of bounds, overlap, or adjacency).
  const handleRotateInPlace = useCallback(
    (row: number, col: number) => {
      if (isPlacementComplete) return;
      const ship = ships.find((s) =>
        s.cells.some((c) => c.row === row && c.col === col),
      );
      if (!ship || ship.cells.length < 2) return;

      const wasVertical = ship.cells[0].col === ship.cells[1].col;
      const anchorIdx = ship.cells.findIndex(
        (c) => c.row === row && c.col === col,
      );
      if (anchorIdx < 0) return;

      const newCells: ShipCell[] = [];
      for (let i = 0; i < ship.size; i++) {
        const offset = i - anchorIdx;
        const cell = wasVertical
          ? { row, col: col + offset }
          : { row: row + offset, col };
        if (
          cell.row < 0 ||
          cell.row >= BOARD_SIZE ||
          cell.col < 0 ||
          cell.col >= BOARD_SIZE
        ) {
          return;
        }
        newCells.push(cell);
      }

      // Validate against a board with the rotating ship's own cells cleared.
      const virtual = board.map((r) => r.slice());
      for (const c of ship.cells) {
        virtual[c.row][c.col] = CELL_STATE.EMPTY;
      }
      const dirs = [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
      ];
      for (const cell of newCells) {
        if (virtual[cell.row][cell.col] !== CELL_STATE.EMPTY) return;
        for (const [dr, dc] of dirs) {
          const r = cell.row + (dr ?? 0);
          const c = cell.col + (dc ?? 0);
          if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
            if (virtual[r][c] === CELL_STATE.SHIP) return;
          }
        }
      }

      handleMoveShip(ship.id, newCells);
    },
    [ships, board, isPlacementComplete, handleMoveShip],
  );

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

  const pendingCells = effectivePendingMove?.newCells ?? [];

  const boardEl = (
    <PlacementBoardGrid
      board={board}
      theme={theme}
      hoveredCells={hoveredCells}
      isInvalidHover={isInvalidHover}
      selectedShip={selectedShip}
      getBoardCellDragProps={getBoardCellDragProps}
      draggingCells={draggingCells}
      pendingCells={pendingCells}
      isPlacementComplete={isPlacementComplete}
      onCellHover={handleCellHover}
      onMouseLeave={handleMouseLeave}
      onCellClick={handleCellClick}
      onCellRotateInPlace={handleRotateInPlace}
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

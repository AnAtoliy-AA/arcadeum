'use client';

import { useState, useCallback, useMemo, memo } from 'react';
import { Text, YStack, useMedia } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { ShipCell, ShipConfig, SeaBattlePlayerState } from '../types';
import { CELL_STATE, getActiveShips } from '../types';
import { PlacementHeader, GameBoardWrapper, BoardContainer } from './styles';
import { useSeaBattleTheme } from '../lib/SeaBattleThemeContext';
import { useDragPlacement } from '../hooks/useDragPlacement';
import { useMobileShipMove } from '../hooks/useMobileShipMove';
import { usePlacementOptimistic } from '../hooks/usePlacementOptimistic';
import {
  createEmptyBoard,
  getCellsForPlacement,
} from './ShipPlacement/placement-utils';

import { ShipPaletteSection } from './ShipPlacement/ShipPaletteSection';
import { PlacementActionsSection } from './ShipPlacement/PlacementActionsSection';
import { PlacementBoardGrid } from './ShipPlacement/PlacementBoardGrid';

interface ShipPlacementBoardProps {
  currentPlayer: SeaBattlePlayerState | null;
  onPlaceShip: (shipId: string, cells: ShipCell[]) => void;
  onMoveShip: (shipId: string, cells: ShipCell[]) => void;
  onConfirmPlacement: () => void;
  onResetPlacement: () => void;
  isPlacementComplete: boolean;
  onAutoPlace?: () => void;
  gridSize?: number;
  shipCount?: number;
}

export const ShipPlacementBoard = memo(function ShipPlacementBoard({
  currentPlayer,
  onPlaceShip,
  onMoveShip,
  onConfirmPlacement,
  onResetPlacement,
  isPlacementComplete,
  onAutoPlace,
  gridSize,
  shipCount,
}: ShipPlacementBoardProps) {
  const boardSize = gridSize ?? currentPlayer?.board.length ?? 10;
  const [selectedShipId, setSelectedShipId] = useState<string | null>(null);
  const [isVertical, setIsVertical] = useState(false);
  const [hoveredCells, setHoveredCells] = useState<ShipCell[]>([]);
  const [isInvalidHover, setIsInvalidHover] = useState(false);
  const { t } = useTranslation();
  const theme = useSeaBattleTheme();
  const media = useMedia();
  const isMobile = !media.gtMd;

  const serverShips = useMemo(
    () => currentPlayer?.ships ?? [],
    [currentPlayer?.ships],
  );
  const serverBoard = useMemo(
    () => currentPlayer?.board || createEmptyBoard(),
    [currentPlayer?.board],
  );

  const { ships, board, registerPlacement, registerMove } =
    usePlacementOptimistic({ serverShips, serverBoard });

  const handleMoveShip = useCallback(
    (shipId: string, cells: ShipCell[]) => {
      const ship = serverShips.find((s) => s.id === shipId);
      if (ship) registerMove(shipId, ship.cells, cells);
      onMoveShip(shipId, cells);
    },
    [serverShips, onMoveShip, registerMove],
  );

  const {
    movingShipId,
    clearMovingState,
    handleCellClick: handleMobileCellClick,
  } = useMobileShipMove({
    ships,
    board,
    isPlacementComplete,
    isMobile,
    onMoveShip: handleMoveShip,
    setHoveredCells,
    setIsInvalidHover,
  });

  const placedShipIds = useMemo(() => new Set(ships.map((s) => s.id)), [ships]);
  const activeShips = useMemo(() => getActiveShips(shipCount), [shipCount]);
  const unplacedShips = useMemo(
    () => activeShips.filter((s) => !placedShipIds.has(s.id)),
    [activeShips, placedShipIds],
  );
  const selectedShip = useMemo(
    () => activeShips.find((s) => s.id === selectedShipId) || null,
    [activeShips, selectedShipId],
  );

  const handlePlaceShip = useCallback(
    (shipId: string, cells: ShipCell[]) => {
      const cfg = activeShips.find((s) => s.id === shipId);
      if (cfg) registerPlacement(shipId, cfg.name, cfg.size, cells);
      onPlaceShip(shipId, cells);
    },
    [activeShips, onPlaceShip, registerPlacement],
  );

  const {
    getDragProps,
    getBoardCellDragProps,
    onDragOver,
    onDrop,
    onDragLeave,
    handleDragEnd,
    draggingCells,
    onTouchBoardPointerDown,
    touchDragJustEnded,
    resetTouchDragJustEnded,
  } = useDragPlacement({
    board,
    isVertical,
    placedShipIds,
    ships,
    activeShips,
    placementComplete: isPlacementComplete,
    onPlaceShip: handlePlaceShip,
    onMoveShip: handleMoveShip,
    setSelectedShipId,
    setHoveredCells,
    setIsInvalidHover,
  });

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
          cell.row >= boardSize ||
          cell.col < 0 ||
          cell.col >= boardSize
        ) {
          return;
        }
        newCells.push(cell);
      }

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
          if (r >= 0 && r < boardSize && c >= 0 && c < boardSize) {
            if (virtual[r][c] === CELL_STATE.SHIP) return;
          }
        }
      }

      handleMoveShip(ship.id, newCells);
    },
    [ships, board, boardSize, isPlacementComplete, handleMoveShip],
  );

  const canPlaceAt = useCallback(
    (row: number, col: number, ship: ShipConfig): boolean => {
      if (!ship) return false;
      const cells = getCellsForPlacement(
        row,
        col,
        ship.size,
        isVertical,
        boardSize,
      );
      if (!cells) return false;

      for (const cell of cells) {
        if (board[cell.row]?.[cell.col] !== CELL_STATE.EMPTY) return false;
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
        for (const [dr, dc] of dirs) {
          const r = cell.row + (dr ?? 0);
          const c = cell.col + (dc ?? 0);
          if (r >= 0 && r < boardSize && c >= 0 && c < boardSize) {
            if (board[r][c] === CELL_STATE.SHIP) return false;
          }
        }
      }
      return true;
    },
    [board, boardSize, isVertical],
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
      setHoveredCells(cells);
      setIsInvalidHover(!canPlaceAt(row, col, selectedShip));
    },
    [selectedShip, isVertical, canPlaceAt],
  );

  const handleMouseLeave = useCallback(() => {
    handleCellHover(-1, -1);
    setIsInvalidHover(false);
  }, [handleCellHover]);

  const handleCellClickInner = useCallback(
    (row: number, col: number) => {
      if (handleMobileCellClick(row, col)) {
        setSelectedShipId(null);
        return;
      }
      if (!selectedShip || !canPlaceAt(row, col, selectedShip)) return;
      const cells = getCellsForPlacement(
        row,
        col,
        selectedShip.size,
        isVertical,
      );
      if (!cells) return;

      handlePlaceShip(selectedShip.id, cells);

      const nextShip = activeShips.find(
        (s) => s.id !== selectedShip.id && !placedShipIds.has(s.id),
      );
      setSelectedShipId(nextShip?.id ?? null);
      setHoveredCells([]);
      setIsInvalidHover(false);
    },
    [
      selectedShip,
      isVertical,
      canPlaceAt,
      handlePlaceShip,
      placedShipIds,
      handleMobileCellClick,
      activeShips,
    ],
  );

  const handleCellClick = (row: number, col: number) => {
    if (touchDragJustEnded.current) {
      resetTouchDragJustEnded();
      return;
    }
    handleCellClickInner(row, col);
  };

  const handleRotate = useCallback(() => setIsVertical((p) => !p), []);
  const isAllShipsPlaced = unplacedShips.length === 0;
  const pendingCells: ShipCell[] = [];

  const shipHeadKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const ship of ships) {
      if (ship.cells.length < 2) continue;
      const head = ship.cells[0];
      if (head) keys.add(`${head.row}-${head.col}`);
    }
    return keys;
  }, [ships]);

  const boardEl = (
    <PlacementBoardGrid
      board={board}
      theme={theme}
      hoveredCells={hoveredCells}
      isInvalidHover={isInvalidHover}
      selectedShip={selectedShip}
      gridSize={gridSize}
      getBoardCellDragProps={getBoardCellDragProps}
      draggingCells={draggingCells}
      pendingCells={pendingCells}
      shipHeadKeys={shipHeadKeys}
      isPlacementComplete={isPlacementComplete}
      movingShipCells={
        movingShipId
          ? (ships.find((s) => s.id === movingShipId)?.cells ?? [])
          : []
      }
      onCellHover={handleCellHover}
      onMouseLeave={handleMouseLeave}
      onCellClick={handleCellClick}
      onCellRotateInPlace={handleRotateInPlace}
      onTouchBoardPointerDown={onTouchBoardPointerDown}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
      t={t}
    />
  );

  if (isMobile) {
    return (
      <YStack
        width="100%"
        gap="$2"
        onDragEnd={handleDragEnd}
        paddingHorizontal="$1"
      >
        <ShipPaletteSection
          theme={theme}
          isMobile={isMobile}
          placedShipIds={placedShipIds}
          selectedShipId={selectedShipId}
          setSelectedShipId={setSelectedShipId}
          getDragProps={getDragProps}
          activeShips={activeShips}
          t={t}
        />
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
          onCancelMove={clearMovingState}
          isMovingShip={!!movingShipId}
          t={t}
        />
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
        <ShipPaletteSection
          theme={theme}
          isMobile={isMobile}
          placedShipIds={placedShipIds}
          selectedShipId={selectedShipId}
          setSelectedShipId={setSelectedShipId}
          getDragProps={getDragProps}
          activeShips={activeShips}
          t={t}
        />
      </GameBoardWrapper>
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
        onCancelMove={clearMovingState}
        isMovingShip={!!movingShipId}
        t={t}
      />
    </YStack>
  );
});
ShipPlacementBoard.displayName = 'ShipPlacementBoard';

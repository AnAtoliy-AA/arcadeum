'use client';

import { useState, useCallback, useMemo, useRef, useEffect, memo } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import type {
  ShipCell,
  ShipConfig,
  SeaBattlePlayerState,
  Ship,
  CellState,
} from '../types';
import { CELL_STATE, getActiveShips } from '../types';
import { PlacementHeader, GameBoardWrapper, BoardContainer } from './styles';
import { useSeaBattleTheme } from '../lib/SeaBattleThemeContext';
import { useDragPlacement } from '../hooks/useDragPlacement';
import { useMobileShipMove } from '../hooks/useMobileShipMove';
import {
  createEmptyBoard,
  getCellsForPlacement,
} from './ShipPlacement/placement-utils';

import { ShipPaletteSection } from './ShipPlacement/ShipPaletteSection';
import { PlacementActionsSection } from './ShipPlacement/PlacementActionsSection';
import { PlacementBoardGrid } from './ShipPlacement/PlacementBoardGrid';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';

interface ShipPlacementBoardProps {
  currentPlayer: SeaBattlePlayerState | null;
  onPlaceShip: (shipId: string, cells: ShipCell[]) => void;
  onMoveShip: (shipId: string, cells: ShipCell[]) => void;
  onConfirmPlacement: (
    ships?: Array<{ shipId: string; cells: ShipCell[] }>,
  ) => void;
  onResetPlacement: () => void;
  isPlacementComplete: boolean;
  onAutoPlace?: () => void;
  gridSize?: number;
  shipCount?: number;
}

function deriveBoard(localShips: Ship[], boardSize: number): CellState[][] {
  const next = createEmptyBoard(boardSize);
  for (const ship of localShips) {
    for (const c of ship.cells) {
      next[c.row][c.col] = CELL_STATE.SHIP;
    }
  }
  return next;
}

export const ShipPlacementBoard = memo(function ShipPlacementBoard({
  currentPlayer,
  onPlaceShip: _onPlaceShip,
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
  const media = useMediaQuery();
  const isMobile = !media.gtMd;
  const serverShips = useMemo(
    () => currentPlayer?.ships ?? [],
    [currentPlayer?.ships],
  );
  const [localShips, setLocalShips] = useState<Ship[]>([]);
  const localShipsRef = useRef<Ship[]>([]);
  const localShipsModifiedRef = useRef(false);
  const prevServerShipsRef = useRef(serverShips);

  useEffect(() => {
    localShipsRef.current = localShips;
  });

  useEffect(() => {
    if (serverShips.length > 0) localShipsModifiedRef.current = false;
    if (prevServerShipsRef.current === serverShips) return;
    prevServerShipsRef.current = serverShips;
    setLocalShips(serverShips);
  }, [serverShips]);

  const board = useMemo(
    () => deriveBoard(localShips, boardSize),
    [localShips, boardSize],
  );

  const handleMoveShip = useCallback(
    (shipId: string, cells: ShipCell[]) => {
      localShipsModifiedRef.current = true;
      setLocalShips((prev) =>
        prev.map((s) => (s.id === shipId ? { ...s, cells } : s)),
      );
      onMoveShip(shipId, cells);
    },
    [onMoveShip],
  );

  const {
    movingShipId,
    clearMovingState,
    handleCellClick: handleMobileCellClick,
  } = useMobileShipMove({
    ships: localShips,
    board,
    isPlacementComplete,
    isMobile,
    gridSize: boardSize,
    onMoveShip: handleMoveShip,
    setHoveredCells,
    setIsInvalidHover,
  });

  const placedShipIds = useMemo(
    () => new Set(localShips.map((s) => s.id)),
    [localShips],
  );
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
      if (!cfg) return;
      const ship: Ship = {
        id: shipId,
        name: cfg.name,
        size: cfg.size,
        cells,
        hits: 0,
        sunk: false,
      };
      localShipsModifiedRef.current = true;
      const nextShips = [...localShipsRef.current, ship];
      setLocalShips(nextShips);
      const nextShip = activeShips.find(
        (s) => s.id !== shipId && !nextShips.some((p) => p.id === s.id),
      );
      setSelectedShipId(nextShip?.id ?? null);
    },
    [activeShips],
  );

  const {
    getDragProps,
    getBoardCellDragProps,
    onDragOver,
    onDrop,
    onDragLeave,
    handleDragEnd,
    draggingCells,
    isTouchDevice,
    onTouchBoardPointerDown,
    touchDragJustEnded,
    resetTouchDragJustEnded,
  } = useDragPlacement({
    board,
    isVertical,
    placedShipIds,
    ships: localShips,
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
      const ship = localShipsRef.current.find((s) =>
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
    [board, boardSize, isPlacementComplete, handleMoveShip],
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

      setHoveredCells([]);
      setIsInvalidHover(false);
    },
    [
      selectedShip,
      isVertical,
      canPlaceAt,
      handlePlaceShip,
      handleMobileCellClick,
    ],
  );

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (touchDragJustEnded.current) {
        resetTouchDragJustEnded();
        return;
      }
      handleCellClickInner(row, col);
    },
    [handleCellClickInner, resetTouchDragJustEnded, touchDragJustEnded],
  );

  const handleRotate = useCallback(() => setIsVertical((p) => !p), []);

  const handleConfirm = useCallback(() => {
    localShipsModifiedRef.current = false;
    const shipsData = localShipsRef.current.map((s) => ({
      shipId: s.id,
      cells: s.cells,
    }));
    onConfirmPlacement(shipsData);
  }, [onConfirmPlacement]);

  const handleReset = useCallback(() => {
    localShipsModifiedRef.current = false;
    setLocalShips([]);
    onResetPlacement();
  }, [onResetPlacement]);

  const handleAutoPlaceInternal = useCallback(() => {
    localShipsModifiedRef.current = false;
    onAutoPlace?.();
  }, [onAutoPlace]);

  const isAllShipsPlaced = unplacedShips.length === 0;
  const pendingCells: ShipCell[] = [];

  const shipHeadKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const ship of localShips) {
      if (ship.cells.length < 2) continue;
      const head = ship.cells[0];
      if (head) keys.add(`${head.row}-${head.col}`);
    }
    return keys;
  }, [localShips]);

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
      isTouchDragEnabled={isTouchDevice}
      movingShipCells={
        movingShipId
          ? (localShips.find((s) => s.id === movingShipId)?.cells ?? [])
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
      <div
        className="flex flex-col items-stretch w-full gap-2 px-1"
        onDragEnd={handleDragEnd}
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
          onConfirm={handleConfirm}
          onReset={handleReset}
          onAutoPlace={handleAutoPlaceInternal}
          onCancelMove={clearMovingState}
          isMovingShip={!!movingShipId}
          t={t}
        />
        <BoardContainer alignSelf="center">{boardEl}</BoardContainer>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-stretch w-full gap-4">
      <GameBoardWrapper onDragEnd={handleDragEnd}>
        <BoardContainer>
          <PlacementHeader className="placement-header">
            <span
              className="text-[20px] font-bold -m-0 placement-title"
              style={{ color: theme.textColor }}
              data-testid="placement-instruction"
            >
              {t('games.sea_battle_v1.table.players.placeShips')}
            </span>
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
        onConfirm={handleConfirm}
        onReset={handleReset}
        onAutoPlace={handleAutoPlaceInternal}
        onCancelMove={clearMovingState}
        isMovingShip={!!movingShipId}
        t={t}
      />
    </div>
  );
});
ShipPlacementBoard.displayName = 'ShipPlacementBoard';

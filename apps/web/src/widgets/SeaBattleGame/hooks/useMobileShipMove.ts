'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { ShipCell, CellState, Ship } from '../types';
import { BOARD_SIZE, CELL_STATE } from '../types';

interface UseMobileShipMoveArgs {
  ships: Ship[];
  board: CellState[][];
  isPlacementComplete: boolean;
  isMobile: boolean;
  onMoveShip: (shipId: string, cells: ShipCell[]) => void;
  setHoveredCells: (cells: ShipCell[]) => void;
  setIsInvalidHover: (v: boolean) => void;
}

function getCells(
  row: number,
  col: number,
  size: number,
  vertical: boolean,
): ShipCell[] | null {
  const cells: ShipCell[] = [];
  for (let i = 0; i < size; i++) {
    const r = vertical ? row + i : row;
    const c = vertical ? col : col + i;
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) return null;
    cells.push({ row: r, col: c });
  }
  return cells;
}

const DIRS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

function canPlaceOnVirtualBoard(
  newCells: ShipCell[],
  board: CellState[][],
  excludeCells: ShipCell[],
): boolean {
  const virtual = board.map((r) => r.slice());
  for (const c of excludeCells) {
    virtual[c.row][c.col] = CELL_STATE.EMPTY;
  }
  for (const cell of newCells) {
    if (virtual[cell.row]?.[cell.col] !== CELL_STATE.EMPTY) return false;
    for (const [dr, dc] of DIRS) {
      const r = cell.row + (dr ?? 0);
      const c = cell.col + (dc ?? 0);
      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
        if (virtual[r][c] === CELL_STATE.SHIP) return false;
      }
    }
  }
  return true;
}

export function useMobileShipMove({
  ships,
  board,
  isPlacementComplete,
  isMobile,
  onMoveShip,
  setHoveredCells,
  setIsInvalidHover,
}: UseMobileShipMoveArgs) {
  const [movingShipId, setMovingShipId] = useState<string | null>(null);
  const isTouchDevice = useRef(false);

  useEffect(() => {
    isTouchDevice.current = window.matchMedia('(pointer: coarse)').matches;
  }, []);

  const clearMovingState = useCallback(() => {
    setMovingShipId(null);
    setHoveredCells([]);
    setIsInvalidHover(false);
  }, [setHoveredCells, setIsInvalidHover]);

  const handleCellClick = useCallback(
    (row: number, col: number): boolean => {
      // Mobile tap-to-move flow: user tapped a placed ship to relocate it
      if (movingShipId) {
        const movingShip = ships.find((s) => s.id === movingShipId);
        if (!movingShip) {
          clearMovingState();
          return true;
        }

        // Tap on the same ship → cancel the move
        const isOnSameShip = movingShip.cells.some(
          (c) => c.row === row && c.col === col,
        );
        if (isOnSameShip) {
          clearMovingState();
          return true;
        }

        // Tap on empty cell → try to move the ship
        const wasVertical =
          movingShip.cells[0]?.col === movingShip.cells[1]?.col;
        const newCells = getCells(row, col, movingShip.size, wasVertical);
        if (!newCells) return true;

        if (canPlaceOnVirtualBoard(newCells, board, movingShip.cells)) {
          onMoveShip(movingShipId, newCells);
        }
        clearMovingState();
        return true;
      }

      // Mobile: tap on a placed ship cell → start moving it
      if ((isMobile || isTouchDevice.current) && !isPlacementComplete) {
        const shipOnCell = ships.find((s) =>
          s.cells.some((c) => c.row === row && c.col === col),
        );
        if (shipOnCell) {
          setMovingShipId(shipOnCell.id);
          setHoveredCells([]);
          setIsInvalidHover(false);
          return true;
        }
      }

      return false;
    },
    [
      movingShipId,
      ships,
      board,
      isPlacementComplete,
      isMobile,
      onMoveShip,
      clearMovingState,
      setHoveredCells,
      setIsInvalidHover,
    ],
  );

  return {
    movingShipId,
    setMovingShipId,
    clearMovingState,
    handleCellClick,
  };
}

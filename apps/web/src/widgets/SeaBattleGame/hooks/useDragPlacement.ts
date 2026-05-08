'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import type { ShipCell, CellState } from '../types';
import { BOARD_SIZE, CELL_STATE, SHIPS } from '../types';

interface UseDragPlacementArgs {
  board: CellState[][];
  isVertical: boolean;
  placedShipIds: Set<string>;
  onPlaceShip: (shipId: string, cells: ShipCell[]) => void;
  setSelectedShipId: (id: string | null) => void;
  setHoveredCells: (cells: ShipCell[]) => void;
  setIsInvalidHover?: (v: boolean) => void;
}

interface DragProps {
  draggable: boolean;
  onDragStart: (e: DragEvent<HTMLElement>) => void;
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

function canPlace(cells: ShipCell[], board: CellState[][]): boolean {
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
      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
        if (board[r][c] === CELL_STATE.SHIP) return false;
      }
    }
  }
  return true;
}

export function useDragPlacement({
  board,
  isVertical,
  placedShipIds,
  onPlaceShip,
  setSelectedShipId,
  setHoveredCells,
  setIsInvalidHover,
}: UseDragPlacementArgs) {
  const isTouchDevice = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const draggingShipId = useRef<string | null>(null);

  useEffect(() => {
    isTouchDevice.current = window.matchMedia('(pointer: coarse)').matches;
  }, []);

  const getDragProps = useCallback(
    (shipId: string): DragProps => {
      const isPlaced = placedShipIds.has(shipId);
      if (isTouchDevice.current || isPlaced) {
        return { draggable: false, onDragStart: () => {} };
      }
      return {
        draggable: true,
        onDragStart: (e: DragEvent<HTMLElement>) => {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', shipId);
          draggingShipId.current = shipId;
          setIsDragging(true);
          setSelectedShipId(null);
        },
      };
    },
    [placedShipIds, setSelectedShipId],
  );

  const onDragOver = useCallback(
    (row: number, col: number, e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      const shipId = draggingShipId.current;
      if (!shipId) return;
      const ship = SHIPS.find((s) => s.id === shipId);
      if (!ship) return;
      const cells = getCells(row, col, ship.size, isVertical);
      if (cells && canPlace(cells, board)) {
        setHoveredCells(cells);
        setIsInvalidHover?.(false);
      } else {
        setHoveredCells([]);
        setIsInvalidHover?.(true);
      }
    },
    [board, isVertical, setHoveredCells, setIsInvalidHover],
  );

  const onDrop = useCallback(
    (row: number, col: number, e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      const shipId = e.dataTransfer.getData('text/plain');
      if (!shipId) return;
      const ship = SHIPS.find((s) => s.id === shipId);
      if (!ship) return;
      const cells = getCells(row, col, ship.size, isVertical);
      if (cells && canPlace(cells, board)) {
        onPlaceShip(shipId, cells);
      }
      setHoveredCells([]);
      setIsInvalidHover?.(false);
      setIsDragging(false);
      draggingShipId.current = null;
    },
    [board, isVertical, onPlaceShip, setHoveredCells, setIsInvalidHover],
  );

  const onDragLeave = useCallback(() => {
    setHoveredCells([]);
    setIsInvalidHover?.(false);
  }, [setHoveredCells, setIsInvalidHover]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    draggingShipId.current = null;
    setHoveredCells([]);
    setIsInvalidHover?.(false);
  }, [setHoveredCells, setIsInvalidHover]);

  return {
    getDragProps,
    onDragOver,
    onDrop,
    onDragLeave,
    handleDragEnd,
    isDragging,
  };
}

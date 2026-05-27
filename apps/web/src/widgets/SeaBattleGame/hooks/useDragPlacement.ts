'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import type { ShipCell, CellState, Ship } from '../types';
import { BOARD_SIZE, CELL_STATE, SHIPS } from '../types';

interface UseDragPlacementArgs {
  board: CellState[][];
  isVertical: boolean;
  placedShipIds: Set<string>;
  ships: Ship[];
  placementComplete: boolean;
  onPlaceShip: (shipId: string, cells: ShipCell[]) => void;
  onMoveShip: (shipId: string, cells: ShipCell[]) => void;
  setSelectedShipId: (id: string | null) => void;
  setHoveredCells: (cells: ShipCell[]) => void;
  setIsInvalidHover?: (v: boolean) => void;
}

interface DragProps {
  draggable: boolean;
  onDragStart: (e: DragEvent<HTMLElement>) => void;
}

type DragMode = 'palette' | 'board' | null;

interface BoardDragOrigin {
  shipId: string;
  originalCells: ShipCell[];
  orientation: 'h' | 'v';
  anchorOffset: number;
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

function cellsEqual(a: ShipCell[], b: ShipCell[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].row !== b[i].row || a[i].col !== b[i].col) return false;
  }
  return true;
}

function getOrientation(cells: ShipCell[]): 'h' | 'v' {
  if (cells.length < 2) return 'h';
  return cells[0].row === cells[1].row ? 'h' : 'v';
}

function boardWithout(
  board: CellState[][],
  cellsToClear: ShipCell[],
): CellState[][] {
  const next = board.map((row) => row.slice());
  for (const c of cellsToClear) {
    next[c.row][c.col] = CELL_STATE.EMPTY;
  }
  return next;
}

export function useDragPlacement({
  board,
  isVertical,
  placedShipIds,
  ships,
  placementComplete,
  onPlaceShip,
  onMoveShip,
  setSelectedShipId,
  setHoveredCells,
  setIsInvalidHover,
}: UseDragPlacementArgs) {
  const isTouchDevice = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggingCells, setDraggingCells] = useState<ShipCell[]>([]);
  const dragMode = useRef<DragMode>(null);
  const draggingShipId = useRef<string | null>(null);
  const boardDragOrigin = useRef<BoardDragOrigin | null>(null);

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
          dragMode.current = 'palette';
          draggingShipId.current = shipId;
          boardDragOrigin.current = null;
          setDraggingCells([]);
          setIsDragging(true);
          setSelectedShipId(null);
        },
      };
    },
    [placedShipIds, setSelectedShipId],
  );

  const getBoardCellDragProps = useCallback(
    (row: number, col: number): DragProps => {
      if (isTouchDevice.current || placementComplete) {
        return { draggable: false, onDragStart: () => {} };
      }
      const ship = ships.find((s) =>
        s.cells.some((c) => c.row === row && c.col === col),
      );
      if (!ship) {
        return { draggable: false, onDragStart: () => {} };
      }
      return {
        draggable: true,
        onDragStart: (e: DragEvent<HTMLElement>) => {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', ship.id);
          const orientation = getOrientation(ship.cells);
          const anchorOffset = ship.cells.findIndex(
            (c) => c.row === row && c.col === col,
          );
          dragMode.current = 'board';
          draggingShipId.current = ship.id;
          boardDragOrigin.current = {
            shipId: ship.id,
            originalCells: ship.cells,
            orientation,
            anchorOffset: anchorOffset >= 0 ? anchorOffset : 0,
          };
          setDraggingCells(ship.cells);
          setIsDragging(true);
          setSelectedShipId(null);
        },
      };
    },
    [ships, placementComplete, setSelectedShipId],
  );

  const onDragOver = useCallback(
    (row: number, col: number, e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      const shipId = draggingShipId.current;
      if (!shipId) return;
      const ship = SHIPS.find((s) => s.id === shipId);
      if (!ship) return;

      if (dragMode.current === 'board') {
        const origin = boardDragOrigin.current;
        if (!origin) return;
        const vertical = origin.orientation === 'v';
        const startRow = vertical ? row - origin.anchorOffset : row;
        const startCol = vertical ? col : col - origin.anchorOffset;
        const cells = getCells(startRow, startCol, ship.size, vertical);
        const virtualBoard = boardWithout(board, origin.originalCells);
        if (cells && canPlace(cells, virtualBoard)) {
          setHoveredCells(cells);
          setIsInvalidHover?.(false);
        } else {
          setHoveredCells([]);
          setIsInvalidHover?.(true);
        }
        return;
      }

      // palette mode
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

  const clearDragState = useCallback(() => {
    setIsDragging(false);
    setDraggingCells([]);
    dragMode.current = null;
    draggingShipId.current = null;
    boardDragOrigin.current = null;
    setHoveredCells([]);
    setIsInvalidHover?.(false);
  }, [setHoveredCells, setIsInvalidHover]);

  const onDrop = useCallback(
    (row: number, col: number, e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      const shipId = e.dataTransfer.getData('text/plain');
      if (!shipId) {
        clearDragState();
        return;
      }
      const ship = SHIPS.find((s) => s.id === shipId);
      if (!ship) {
        clearDragState();
        return;
      }

      const mode = dragMode.current;
      const origin = boardDragOrigin.current;

      if (mode === 'board' && origin) {
        const vertical = origin.orientation === 'v';
        const startRow = vertical ? row - origin.anchorOffset : row;
        const startCol = vertical ? col : col - origin.anchorOffset;
        const cells = getCells(startRow, startCol, ship.size, vertical);
        const virtualBoard = boardWithout(board, origin.originalCells);
        if (
          cells &&
          canPlace(cells, virtualBoard) &&
          !cellsEqual(cells, origin.originalCells)
        ) {
          onMoveShip(shipId, cells);
        }
        clearDragState();
        return;
      }

      // palette mode
      const cells = getCells(row, col, ship.size, isVertical);
      if (cells && canPlace(cells, board)) {
        onPlaceShip(shipId, cells);
      }
      clearDragState();
    },
    [board, isVertical, onPlaceShip, onMoveShip, clearDragState],
  );

  const onDragLeave = useCallback(() => {
    setHoveredCells([]);
    setIsInvalidHover?.(false);
  }, [setHoveredCells, setIsInvalidHover]);

  const handleDragEnd = useCallback(() => {
    clearDragState();
  }, [clearDragState]);

  return {
    getDragProps,
    getBoardCellDragProps,
    onDragOver,
    onDrop,
    onDragLeave,
    handleDragEnd,
    isDragging,
    draggingCells,
  };
}

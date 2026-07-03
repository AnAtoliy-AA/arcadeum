'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import type { ShipCell, CellState, Ship } from '../types';
import { CELL_STATE, SHIPS } from '../types';
import { getCells, canPlace, cellsEqual } from './drag-helpers';

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

function findCellFromPoint(
  x: number,
  y: number,
): { row: number; col: number } | null {
  const el = document.elementFromPoint(x, y) as HTMLElement | null;
  if (!el) return null;
  let current: HTMLElement | null = el;
  while (current && current !== document.body) {
    const r = current.dataset?.row;
    const c = current.dataset?.col;
    if (r !== undefined && c !== undefined) {
      const row = parseInt(r, 10);
      const col = parseInt(c, 10);
      if (!isNaN(row) && !isNaN(col)) return { row, col };
    }
    current = current.parentElement;
  }
  return null;
}

const TOUCH_DRAG_THRESHOLD = 10;

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

  const touchRef = useRef<{
    active: boolean;
    started: boolean;
    startX: number;
    startY: number;
    shipId: string | null;
    origin: BoardDragOrigin | null;
  }>({
    active: false,
    started: false,
    startX: 0,
    startY: 0,
    shipId: null,
    origin: null,
  });
  const touchDragJustEnded = useRef(false);
  const boardRef = useRef(board);
  const onMoveShipRef = useRef(onMoveShip);

  useEffect(() => {
    boardRef.current = board;
    onMoveShipRef.current = onMoveShip;
  });

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

  const onTouchBoardPointerDown = useCallback(
    (row: number, col: number, e: React.PointerEvent) => {
      if (!isTouchDevice.current || placementComplete) return;

      const ship = ships.find((s) =>
        s.cells.some((c) => c.row === row && c.col === col),
      );
      if (!ship) return;

      const orientation = getOrientation(ship.cells);
      const anchorOffset = ship.cells.findIndex(
        (c) => c.row === row && c.col === col,
      );

      touchRef.current = {
        active: true,
        started: false,
        startX: e.clientX,
        startY: e.clientY,
        shipId: ship.id,
        origin: {
          shipId: ship.id,
          originalCells: ship.cells,
          orientation,
          anchorOffset: anchorOffset >= 0 ? anchorOffset : 0,
        },
      };

      const onMove = (me: PointerEvent) => {
        const t = touchRef.current;
        if (!t.active || !t.origin) return;

        if (!t.started) {
          const dx = me.clientX - t.startX;
          const dy = me.clientY - t.startY;
          if (
            Math.abs(dx) < TOUCH_DRAG_THRESHOLD &&
            Math.abs(dy) < TOUCH_DRAG_THRESHOLD
          )
            return;

          t.started = true;
          draggingShipId.current = t.shipId;
          dragMode.current = 'board';
          boardDragOrigin.current = t.origin;
          setDraggingCells(t.origin.originalCells);
          setIsDragging(true);
          setSelectedShipId(null);
        }

        const cell = findCellFromPoint(me.clientX, me.clientY);
        if (cell && t.origin) {
          const shipDef = SHIPS.find((s) => s.id === t.shipId);
          if (!shipDef) return;
          const vertical = t.origin.orientation === 'v';
          const startRow = vertical
            ? cell.row - t.origin.anchorOffset
            : cell.row;
          const startCol = vertical
            ? cell.col
            : cell.col - t.origin.anchorOffset;
          const cells = getCells(startRow, startCol, shipDef.size, vertical);
          const virtualBoard = boardWithout(
            boardRef.current,
            t.origin.originalCells,
          );
          if (cells && canPlace(cells, virtualBoard)) {
            setHoveredCells(cells);
            setIsInvalidHover?.(false);
          } else {
            setHoveredCells([]);
            setIsInvalidHover?.(true);
          }
        }
      };

      const onUp = (ue: PointerEvent) => {
        const t = touchRef.current;
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);

        if (t.started && t.shipId && t.origin) {
          const cell = findCellFromPoint(ue.clientX, ue.clientY);
          if (cell) {
            const shipDef = SHIPS.find((s) => s.id === t.shipId);
            if (shipDef) {
              const vertical = t.origin.orientation === 'v';
              const startRow = vertical
                ? cell.row - t.origin.anchorOffset
                : cell.row;
              const startCol = vertical
                ? cell.col
                : cell.col - t.origin.anchorOffset;
              const cells = getCells(
                startRow,
                startCol,
                shipDef.size,
                vertical,
              );
              const virtualBoard = boardWithout(
                boardRef.current,
                t.origin.originalCells,
              );
              if (
                cells &&
                canPlace(cells, virtualBoard) &&
                !cellsEqual(cells, t.origin.originalCells)
              ) {
                onMoveShipRef.current(t.shipId, cells);
              }
            }
          }
          clearDragState();
          touchDragJustEnded.current = true;
          setTimeout(() => {
            touchDragJustEnded.current = false;
          }, 300);
        }

        touchRef.current = {
          active: false,
          started: false,
          startX: 0,
          startY: 0,
          shipId: null,
          origin: null,
        };
      };

      document.addEventListener('pointermove', onMove, { passive: false });
      document.addEventListener('pointerup', onUp);
    },
    [
      ships,
      placementComplete,
      setSelectedShipId,
      setHoveredCells,
      setIsInvalidHover,
      clearDragState,
    ],
  );

  return {
    getDragProps,
    getBoardCellDragProps,
    onDragOver,
    onDrop,
    onDragLeave,
    handleDragEnd,
    isDragging,
    draggingCells,
    onTouchBoardPointerDown,
    touchDragJustEnded,
    resetTouchDragJustEnded: useCallback(() => {
      touchDragJustEnded.current = false;
    }, []),
  };
}

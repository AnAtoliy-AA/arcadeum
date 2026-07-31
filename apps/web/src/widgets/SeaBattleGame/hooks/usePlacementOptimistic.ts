'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { ShipCell, CellState, Ship } from '../types';
import { CELL_STATE } from '../types';

interface UsePlacementOptimisticArgs {
  serverShips: Ship[];
  serverBoard: CellState[][];
}

export function usePlacementOptimistic({
  serverShips,
  serverBoard,
}: UsePlacementOptimisticArgs) {
  const [rawPendingPlacements, setRawPendingPlacements] = useState<
    Map<string, { ship: Ship; cells: ShipCell[] }>
  >(new Map());

  // Auto-clear stale pending placements after 3s
  useEffect(() => {
    if (rawPendingPlacements.size === 0) return;
    const timer = setTimeout(() => setRawPendingPlacements(new Map()), 3000);
    return () => clearTimeout(timer);
  }, [rawPendingPlacements]);

  const pendingPlacements = useMemo(() => {
    if (rawPendingPlacements.size === 0) return rawPendingPlacements;
    const serverIds = new Set(serverShips.map((s) => s.id));
    let changed = false;
    const cleaned = new Map(rawPendingPlacements);
    for (const [id] of cleaned) {
      if (serverIds.has(id)) {
        cleaned.delete(id);
        changed = true;
      }
    }
    return changed ? cleaned : rawPendingPlacements;
  }, [serverShips, rawPendingPlacements]);

  const [pendingMoves, setPendingMoves] = useState<
    Map<string, { originalCells: ShipCell[]; newCells: ShipCell[] }>
  >(new Map());

  const effectivePendingMoves = useMemo(() => {
    if (pendingMoves.size === 0) return pendingMoves;
    const cleaned = new Map(pendingMoves);
    let changed = false;
    for (const [shipId, move] of cleaned) {
      const ship = serverShips.find((s) => s.id === shipId);
      if (!ship) continue;
      const matchesNew =
        ship.cells.length === move.newCells.length &&
        ship.cells.every(
          (c, i) =>
            c.row === move.newCells[i].row && c.col === move.newCells[i].col,
        );
      if (matchesNew) {
        cleaned.delete(shipId);
        changed = true;
      }
    }
    return changed ? cleaned : pendingMoves;
  }, [serverShips, pendingMoves]);

  const ships = useMemo<Ship[]>(() => {
    let result = serverShips;
    if (effectivePendingMoves.size > 0) {
      result = result.map((s) => {
        const move = effectivePendingMoves.get(s.id);
        return move ? { ...s, cells: move.newCells } : s;
      });
    }
    for (const [, entry] of pendingPlacements) {
      if (!result.some((s) => s.id === entry.ship.id)) {
        result = [...result, entry.ship];
      }
    }
    return result;
  }, [serverShips, effectivePendingMoves, pendingPlacements]);

  const board = useMemo<CellState[][]>(() => {
    const next = serverBoard.map((row) => row.slice());
    for (const [, move] of effectivePendingMoves) {
      for (const c of move.originalCells) {
        next[c.row][c.col] = CELL_STATE.EMPTY;
      }
      for (const c of move.newCells) {
        next[c.row][c.col] = CELL_STATE.SHIP;
      }
    }
    for (const [, entry] of pendingPlacements) {
      for (const c of entry.cells) {
        next[c.row][c.col] = CELL_STATE.SHIP;
      }
    }
    return next;
  }, [serverBoard, effectivePendingMoves, pendingPlacements]);

  const registerPlacement = useCallback(
    (shipId: string, name: string, size: number, cells: ShipCell[]) => {
      setRawPendingPlacements((prev) => {
        const next = new Map(prev);
        next.set(shipId, {
          ship: { id: shipId, name, size, cells, hits: 0, sunk: false },
          cells,
        });
        return next;
      });
    },
    [],
  );

  const registerMove = useCallback(
    (shipId: string, originalCells: ShipCell[], newCells: ShipCell[]) => {
      setPendingMoves((prev) => {
        const next = new Map(prev);
        next.set(shipId, { originalCells, newCells });
        return next;
      });
    },
    [],
  );

  const clearPendingMoves = useCallback(() => {
    setPendingMoves(new Map());
  }, []);

  return {
    ships,
    board,
    registerPlacement,
    registerMove,
    clearPendingMoves,
  };
}

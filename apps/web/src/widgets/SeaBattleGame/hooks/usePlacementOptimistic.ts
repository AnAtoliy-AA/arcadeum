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

  useEffect(() => {
    if (!pendingMove) return;
    const timer = setTimeout(() => setPendingMove(null), 2000);
    return () => clearTimeout(timer);
  }, [pendingMove]);

  const ships = useMemo<Ship[]>(() => {
    let result = serverShips;
    if (effectivePendingMove) {
      result = result.map((s) =>
        s.id === effectivePendingMove.shipId
          ? { ...s, cells: effectivePendingMove.newCells }
          : s,
      );
    }
    for (const [, entry] of pendingPlacements) {
      if (!result.some((s) => s.id === entry.ship.id)) {
        result = [...result, entry.ship];
      }
    }
    return result;
  }, [serverShips, effectivePendingMove, pendingPlacements]);

  const board = useMemo<CellState[][]>(() => {
    const next = serverBoard.map((row) => row.slice());
    if (effectivePendingMove) {
      for (const c of effectivePendingMove.originalCells) {
        next[c.row][c.col] = CELL_STATE.EMPTY;
      }
      for (const c of effectivePendingMove.newCells) {
        next[c.row][c.col] = CELL_STATE.SHIP;
      }
    }
    for (const [, entry] of pendingPlacements) {
      for (const c of entry.cells) {
        next[c.row][c.col] = CELL_STATE.SHIP;
      }
    }
    return next;
  }, [serverBoard, effectivePendingMove, pendingPlacements]);

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
      setPendingMove({ shipId, originalCells, newCells });
    },
    [],
  );

  return {
    ships,
    board,
    registerPlacement,
    registerMove,
  };
}

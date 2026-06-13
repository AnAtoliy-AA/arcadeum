import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDragPlacement } from './useDragPlacement';
import { BOARD_SIZE, CELL_STATE, type CellState, type Ship } from '../types';

function emptyBoard(): CellState[][] {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from<CellState>({ length: BOARD_SIZE }).fill(CELL_STATE.EMPTY),
  );
}

// Place a horizontal ship at the start of a row, stamping the board cells.
function boardWithShip(ship: Ship): CellState[][] {
  const b = emptyBoard();
  for (const cell of ship.cells) {
    b[cell.row][cell.col] = CELL_STATE.SHIP;
  }
  return b;
}

function makeDataTransfer() {
  const store = new Map<string, string>();
  return {
    store,
    effectAllowed: 'move' as const,
    setData: (k: string, v: string) => store.set(k, v),
    getData: (k: string) => store.get(k) ?? '',
  };
}

const battleship: Ship = {
  id: 'battleship-1',
  name: 'Battleship',
  size: 4,
  hits: 0,
  sunk: false,
  cells: [
    { row: 0, col: 0 },
    { row: 0, col: 1 },
    { row: 0, col: 2 },
    { row: 0, col: 3 },
  ],
};

function setup(
  overrides: Partial<Parameters<typeof useDragPlacement>[0]> = {},
) {
  const onPlaceShip = vi.fn();
  const onMoveShip = vi.fn();
  const setSelectedShipId = vi.fn();
  const setHoveredCells = vi.fn();
  const setIsInvalidHover = vi.fn();
  const board = boardWithShip(battleship);

  const result = renderHook(() =>
    useDragPlacement({
      board,
      isVertical: false,
      placedShipIds: new Set([battleship.id]),
      ships: [battleship],
      placementComplete: false,
      onPlaceShip,
      onMoveShip,
      setSelectedShipId,
      setHoveredCells,
      setIsInvalidHover,
      ...overrides,
    }),
  );
  return { result, onPlaceShip, onMoveShip, setSelectedShipId };
}

beforeEach(() => {
  // jsdom defaults pointer:fine, so isTouchDevice stays false.
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (q: string) => ({
      matches: false,
      media: q,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
});

describe('useDragPlacement — board source', () => {
  it('a ship cell exposes draggable=true via getBoardCellDragProps', () => {
    const { result } = setup();
    const props = result.result.current.getBoardCellDragProps(0, 0);
    expect(props.draggable).toBe(true);
  });

  it('an empty cell exposes draggable=false', () => {
    const { result } = setup();
    const props = result.result.current.getBoardCellDragProps(5, 5);
    expect(props.draggable).toBe(false);
  });

  it('emits onMoveShip with anchor-adjusted cells when dropping a ship grabbed mid-body', () => {
    const { result, onMoveShip } = setup();
    const hook = result.result.current;
    const dt = makeDataTransfer();

    // Grab the 2nd cell of the 4-cell horizontal ship (row 0, col 1)
    act(() => {
      hook.getBoardCellDragProps(0, 1).onDragStart({
        dataTransfer: dt,
        preventDefault: () => {},
      } as unknown as React.DragEvent<HTMLElement>);
    });

    // Drop on F5 (row 5, col 5). Anchor offset = 1, orientation = h.
    // Expected start: (5, 4); cells: (5,4) (5,5) (5,6) (5,7).
    act(() => {
      hook.onDrop(5, 5, {
        dataTransfer: dt,
        preventDefault: () => {},
      } as unknown as React.DragEvent<HTMLElement>);
    });

    expect(onMoveShip).toHaveBeenCalledTimes(1);
    expect(onMoveShip).toHaveBeenCalledWith('battleship-1', [
      { row: 5, col: 4 },
      { row: 5, col: 5 },
      { row: 5, col: 6 },
      { row: 5, col: 7 },
    ]);
  });

  it('does not emit onMoveShip when dropped on the same cells (no-op move)', () => {
    const { result, onMoveShip } = setup();
    const hook = result.result.current;
    const dt = makeDataTransfer();

    // Grab the head of the ship at (0,0)
    act(() => {
      hook.getBoardCellDragProps(0, 0).onDragStart({
        dataTransfer: dt,
        preventDefault: () => {},
      } as unknown as React.DragEvent<HTMLElement>);
    });
    // Drop at (0,0) again — same cells.
    act(() => {
      hook.onDrop(0, 0, {
        dataTransfer: dt,
        preventDefault: () => {},
      } as unknown as React.DragEvent<HTMLElement>);
    });

    expect(onMoveShip).not.toHaveBeenCalled();
  });

  it('does not emit onMoveShip when the drop is off-board', () => {
    const { result, onMoveShip } = setup();
    const hook = result.result.current;
    const dt = makeDataTransfer();

    act(() => {
      hook.getBoardCellDragProps(0, 0).onDragStart({
        dataTransfer: dt,
        preventDefault: () => {},
      } as unknown as React.DragEvent<HTMLElement>);
    });
    // Drop at (0, 9) — ship would extend out to col 12.
    act(() => {
      hook.onDrop(0, 9, {
        dataTransfer: dt,
        preventDefault: () => {},
      } as unknown as React.DragEvent<HTMLElement>);
    });

    expect(onMoveShip).not.toHaveBeenCalled();
  });

  it('does not allow drag from board cells when placement is complete', () => {
    const { result } = setup({ placementComplete: true });
    const props = result.result.current.getBoardCellDragProps(0, 0);
    expect(props.draggable).toBe(false);
  });
});

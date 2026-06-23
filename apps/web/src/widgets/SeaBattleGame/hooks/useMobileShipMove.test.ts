import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useMobileShipMove } from './useMobileShipMove';
import { BOARD_SIZE, CELL_STATE, type CellState, type Ship } from '../types';

function emptyBoard(): CellState[][] {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from<CellState>({ length: BOARD_SIZE }).fill(CELL_STATE.EMPTY),
  );
}

function boardWithShip(ship: Ship): CellState[][] {
  const b = emptyBoard();
  for (const cell of ship.cells) {
    b[cell.row][cell.col] = CELL_STATE.SHIP;
  }
  return b;
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
  overrides: Partial<Parameters<typeof useMobileShipMove>[0]> = {},
) {
  const onMoveShip = vi.fn();
  const setHoveredCells = vi.fn();
  const setIsInvalidHover = vi.fn();
  const board = boardWithShip(battleship);

  const result = renderHook(() =>
    useMobileShipMove({
      ships: [battleship],
      board,
      isPlacementComplete: false,
      isMobile: true,
      onMoveShip,
      setHoveredCells,
      setIsInvalidHover,
      ...overrides,
    }),
  );
  return { result, onMoveShip, setHoveredCells, setIsInvalidHover };
}

describe('useMobileShipMove', () => {
  it('returns false for empty cells on mobile (no ship to pick up)', () => {
    const { result } = setup();
    let consumed: boolean = false;
    act(() => {
      consumed = result.result.current.handleCellClick(5, 5);
    });
    expect(consumed).toBe(false);
  });

  it('returns true and sets movingShipId when tapping a placed ship on mobile', () => {
    const { result, setHoveredCells, setIsInvalidHover } = setup();
    act(() => {
      const consumed = result.result.current.handleCellClick(0, 0);
      expect(consumed).toBe(true);
    });
    expect(result.result.current.movingShipId).toBe('battleship-1');
    expect(setHoveredCells).toHaveBeenCalledWith([]);
    expect(setIsInvalidHover).toHaveBeenCalledWith(false);
  });

  it('does not start moving when isMobile is false (desktop)', () => {
    const { result } = setup({ isMobile: false });
    let consumed: boolean = false;
    act(() => {
      consumed = result.result.current.handleCellClick(0, 0);
    });
    expect(consumed).toBe(false);
    expect(result.result.current.movingShipId).toBeNull();
  });

  it('starts moving when isMobile is false but device has coarse pointer', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(pointer: coarse)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
    const { result } = setup({ isMobile: false });
    act(() => {
      const consumed = result.result.current.handleCellClick(0, 0);
      expect(consumed).toBe(true);
    });
    expect(result.result.current.movingShipId).toBe('battleship-1');
  });

  it('does not start moving when placement is complete', () => {
    const { result } = setup({ isPlacementComplete: true });
    let consumed: boolean = false;
    act(() => {
      consumed = result.result.current.handleCellClick(0, 0);
    });
    expect(consumed).toBe(false);
    expect(result.result.current.movingShipId).toBeNull();
  });

  it('moves ship to a valid empty position on second tap', () => {
    const { result, onMoveShip } = setup();
    act(() => {
      result.result.current.handleCellClick(0, 0);
    });
    expect(result.result.current.movingShipId).toBe('battleship-1');

    act(() => {
      result.result.current.handleCellClick(5, 5);
    });
    expect(onMoveShip).toHaveBeenCalledWith('battleship-1', [
      { row: 5, col: 5 },
      { row: 5, col: 6 },
      { row: 5, col: 7 },
      { row: 5, col: 8 },
    ]);
    expect(result.result.current.movingShipId).toBeNull();
  });

  it('cancels move when tapping the same ship', () => {
    const { result, onMoveShip } = setup();
    act(() => {
      result.result.current.handleCellClick(0, 0);
    });
    expect(result.result.current.movingShipId).toBe('battleship-1');

    act(() => {
      result.result.current.handleCellClick(0, 1);
    });
    expect(result.result.current.movingShipId).toBeNull();
    expect(onMoveShip).not.toHaveBeenCalled();
  });

  it('keeps moving state when destination is out of bounds (retry allowed)', () => {
    const { result, onMoveShip } = setup();
    act(() => {
      result.result.current.handleCellClick(0, 0);
    });

    act(() => {
      result.result.current.handleCellClick(0, 9);
    });
    expect(result.result.current.movingShipId).toBe('battleship-1');
    expect(onMoveShip).not.toHaveBeenCalled();
  });
});
